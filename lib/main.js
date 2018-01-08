let InlineMarkdownImage

function createInlineMarkdownImage(editor) {
  if (["GitHub Markdown", "Markdown"].includes(editor.getGrammar().name)) {
    if (!InlineMarkdownImage) {
      InlineMarkdownImage = require("./inline-markdown-image")
      InlineMarkdownImage.init()
    }
    InlineMarkdownImage.create(editor)
  }
}

module.exports = {
  activate() {
    this.disposable = atom.workspace.observeTextEditors(createInlineMarkdownImage)
  },

  deactivate() {
    if (InlineMarkdownImage) InlineMarkdownImage.destroyAll()
    this.disposable.dispose()
  },
}
