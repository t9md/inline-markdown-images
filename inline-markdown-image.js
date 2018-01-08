const {CompositeDisposable} = require("atom")
const Path = require("path")
const REGEX_IMAGES = /^!\[[^\]\n]*\]\(([^)\n]+)\)$/g
const REGEX_NETWORK_PATH = /^(?:[a-z]+:)?\/\//i

function buildElement(src) {
  const div = document.createElement("div")
  const img = document.createElement("img")
  img.src = src
  img.onload = () => (div.style.display = "block")
  div.appendChild(img)
  return div
}

module.exports = class InlineMarkdownImage {
  static init() {
    this.instanceByEditor = new Map()
  }
  static create(editor) {
    this.instanceByEditor.set(editor, new this(editor))
  }
  static destroyAll() {
    this.instanceByEditor.forEach(instance => instance.destroy())
  }

  constructor(editor) {
    this.editor = editor
    this.disposables = new CompositeDisposable(
      editor.onDidStopChanging(() => this.refresh()),
      editor.onDidDestroy(() => this.destroy())
    )
    this.markers = []
    this.refresh()
  }

  refresh() {
    this.markers.filter(marker => !marker.isValid()).forEach(marker => marker.destroy())
    this.markers = this.markers.filter(marker => !marker.isDestroyed())

    const startRowsOfRenderedImages = this.markers.map(marker => marker.getBufferRange().start.row)

    this.editor.scan(REGEX_IMAGES, ({range, match}) => {
      // Skip already rendered link
      if (startRowsOfRenderedImages.includes(range.start.row)) return

      const marker = this.editor.markBufferRange(range, {invalidate: "inside"})
      this.markers.push(marker)
      const link = match[1]
      const src =
        REGEX_NETWORK_PATH.test(link) || Path.isAbsolute(link)
          ? link
          : Path.join(Path.dirname(this.editor.getPath()), link)

      this.editor.decorateMarker(marker, {type: "block", item: buildElement(src), position: "after"})
    })
  }

  destroy() {
    this.disposables.dispose()
  }
}
