const {CompositeDisposable} = require("atom")
const Path = require("path")

const REGEX_IMAGES = /!\[.*?\]\((.+?)\)/g
const REGEX_NETWORK_PATH = /^(?:[a-z]+:)?\/\//i

const isAbsoluteLink = link => REGEX_NETWORK_PATH.test(link) || Path.isAbsolute(link)

module.exports = class InlineImage {
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

    const rangesOfRenderedImages = this.markers.map(marker => marker.getBufferRange())
    const isRendered = range => rangesOfRenderedImages.some(renderedRange => renderedRange.isEqual(range))

    this.editor.scan(REGEX_IMAGES, ({range, match}) => {
      if (isRendered(range)) return

      const marker = this.editor.markBufferRange(range, {invalidate: "inside"})
      this.markers.push(marker)

      const img = document.createElement("img")
      const link = match[1]
      img.src = isAbsoluteLink(link) ? link : Path.join(Path.dirname(this.editor.getPath()), link)
      this.editor.decorateMarker(marker, {type: "block", item: img, position: "after"})
    })
  }

  destroy() {
    this.disposables.dispose()
    this.markers.forEach(marker => marker.destroy())
  }
}
