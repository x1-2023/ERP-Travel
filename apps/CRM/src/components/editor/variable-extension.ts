import { Node, mergeAttributes } from '@tiptap/react'

export interface VariableNodeAttrs {
  key: string
  label: string
}

export const VariableNode = Node.create({
  name: 'variable',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      key: { default: '' },
      label: { default: '' },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-variable]',
        getAttrs: (el) => {
          const element = el as HTMLElement
          return {
            key: element.getAttribute('data-variable') || '',
            label: element.textContent || '',
          }
        },
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-variable': node.attrs.key,
        class: 'variable-chip',
      }),
      `{{${node.attrs.label}}}`,
    ]
  },

  renderText({ node }) {
    return `{{${node.attrs.key}}}`
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('span')
      dom.classList.add('variable-chip')
      dom.setAttribute('data-variable', node.attrs.key)
      dom.contentEditable = 'false'
      dom.textContent = `{{${node.attrs.label}}}`
      return { dom }
    }
  },
})
