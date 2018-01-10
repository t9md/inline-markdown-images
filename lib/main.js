let InlineImage

function createInlineMarkdownImage(editor) {
  if (["GitHub Markdown", "Markdown"].includes(editor.getGrammar().name)) {
    if (!InlineImage) {
      InlineImage = require("./inline-image")
      InlineImage.init()
    }
    InlineImage.create(editor)
  }
}

module.exports = {
  activate() {
    this.disposable = atom.workspace.observeTextEditors(createInlineMarkdownImage)
  },

  deactivate() {
    if (InlineImage) InlineImage.destroyAll()
    this.disposable.dispose()
  },
}
