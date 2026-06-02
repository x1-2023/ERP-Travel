'use client'

import './editor-styles.css'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import { VariableNode } from './variable-extension'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  ImageIcon,
  Code2,
  Unlink,
} from 'lucide-react'

export interface Variable {
  key: string
  label: string
  preview?: string
}

export const CAMPAIGN_VARIABLES: Variable[] = [
  { key: 'firstName', label: 'Tên', preview: 'Nguyễn' },
  { key: 'lastName', label: 'Họ', preview: 'Văn A' },
  { key: 'fullName', label: 'Họ tên', preview: 'Nguyễn Văn A' },
  { key: 'email', label: 'Email', preview: 'a@email.com' },
  { key: 'company', label: 'Công ty', preview: 'ABC Corp' },
  { key: 'title', label: 'Chức danh', preview: 'Giám đốc' },
]

export interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  readOnly?: boolean
  variables?: Variable[]
  minHeight?: number
  maxHeight?: number
  className?: string
}

// ── Toolbar Button ──────────────────────────────────────────
function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        flex h-8 w-8 items-center justify-center rounded transition-colors
        ${active
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
          : 'text-[var(--crm-text-secondary)] hover:bg-[var(--crm-bg-hover)] hover:text-[var(--crm-text-primary)]'
        }
        ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}
      `}
    >
      {children}
    </button>
  )
}

function ToolbarSeparator() {
  return <div className="mx-1 h-6 w-px bg-[var(--crm-border)]" />
}

// ── Link Dialog ─────────────────────────────────────────────
function LinkDialog({
  initialUrl,
  onSubmit,
  onRemove,
  onCancel,
}: {
  initialUrl?: string
  onSubmit: (url: string) => void
  onRemove?: () => void
  onCancel: () => void
}) {
  const [url, setUrl] = useState(initialUrl || '')
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="absolute left-0 top-full z-50 mt-1 flex items-center gap-2 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-bg-card)] p-2 shadow-lg">
      <input
        ref={inputRef}
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://"
        className="h-8 w-56 rounded border border-[var(--crm-border)] bg-[var(--crm-bg-page)] px-2 text-sm text-[var(--crm-text-primary)] outline-none focus:border-emerald-500"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter' && url) onSubmit(url)
          if (e.key === 'Escape') onCancel()
        }}
      />
      <button
        type="button"
        onClick={() => url && onSubmit(url)}
        disabled={!url}
        className="h-8 rounded bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-40"
      >
        Thêm
      </button>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="flex h-8 w-8 items-center justify-center rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          title="Xóa liên kết"
        >
          <Unlink className="h-4 w-4" />
        </button>
      )}
      <button
        type="button"
        onClick={onCancel}
        className="h-8 rounded px-3 text-xs text-[var(--crm-text-secondary)] hover:bg-[var(--crm-bg-hover)]"
      >
        Hủy
      </button>
    </div>
  )
}

// ── Image Dialog ────────────────────────────────────────────
function ImageDialog({
  onSubmit,
  onCancel,
}: {
  onSubmit: (url: string, alt: string) => void
  onCancel: () => void
}) {
  const [url, setUrl] = useState('')
  const [alt, setAlt] = useState('')

  return (
    <div className="absolute left-0 top-full z-50 mt-1 flex flex-col gap-2 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-bg-card)] p-3 shadow-lg">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="URL hình ảnh"
        className="h-8 w-64 rounded border border-[var(--crm-border)] bg-[var(--crm-bg-page)] px-2 text-sm text-[var(--crm-text-primary)] outline-none focus:border-emerald-500"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Escape') onCancel()
        }}
      />
      <input
        type="text"
        value={alt}
        onChange={(e) => setAlt(e.target.value)}
        placeholder="Mô tả hình ảnh"
        className="h-8 w-64 rounded border border-[var(--crm-border)] bg-[var(--crm-bg-page)] px-2 text-sm text-[var(--crm-text-primary)] outline-none focus:border-emerald-500"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && url) onSubmit(url, alt)
          if (e.key === 'Escape') onCancel()
        }}
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-8 rounded px-3 text-xs text-[var(--crm-text-secondary)] hover:bg-[var(--crm-bg-hover)]"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={() => url && onSubmit(url, alt)}
          disabled={!url}
          className="h-8 rounded bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-40"
        >
          Chèn hình
        </button>
      </div>
    </div>
  )
}

// ── Variable Dropdown ───────────────────────────────────────
function VariableDropdown({
  variables,
  onSelect,
  onClose,
}: {
  variables: Variable[]
  onSelect: (v: Variable) => void
  onClose: () => void
}) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-lg border border-[var(--crm-border)] bg-[var(--crm-bg-card)] py-1 shadow-lg">
        <div className="border-b border-[var(--crm-border)] px-3 py-1.5 text-xs font-medium text-[var(--crm-text-muted)]">
          Chèn biến
        </div>
        {variables.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => {
              onSelect(v)
              onClose()
            }}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-[var(--crm-text-primary)] hover:bg-[var(--crm-bg-hover)]"
          >
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 font-mono text-xs text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
              {`{{${v.label}}}`}
            </span>
          </button>
        ))}
      </div>
    </>
  )
}

// ── Main Editor ─────────────────────────────────────────────
export function RichTextEditor({
  value,
  onChange,
  placeholder = '',
  readOnly = false,
  variables,
  minHeight = 200,
  maxHeight = 500,
  className = '',
}: RichTextEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [showVariables, setShowVariables] = useState(false)

  // For readOnly preview: replace {{key}} with preview values
  const processedValue = useMemo(() => {
    if (!readOnly || !variables?.length) return value
    let html = value
    for (const v of variables) {
      if (v.preview) {
        html = html.replace(
          new RegExp(`\\{\\{${v.key}\\}\\}`, 'g'),
          v.preview
        )
      }
    }
    // Also handle variable chips in data-variable spans
    for (const v of variables) {
      if (v.preview) {
        const re = new RegExp(
          `<span[^>]*data-variable="${v.key}"[^>]*>[^<]*</span>`,
          'g'
        )
        html = html.replace(re, v.preview)
      }
    }
    return html
  }, [readOnly, value, variables])

  const handleUpdate = useCallback(
    ({ editor }: { editor: { getHTML: () => string } }) => {
      // Convert variable chips to {{key}} in output
      let html = editor.getHTML()
      html = html.replace(
        /<span[^>]*data-variable="([^"]*)"[^>]*class="variable-chip"[^>]*>[^<]*<\/span>/g,
        (_match, key) => `{{${key}}}`
      )
      onChange(html)
    },
    [onChange]
  )

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Highlight,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
      }),
      Image.configure({
        HTMLAttributes: { style: 'max-width: 100%; height: auto;' },
      }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      VariableNode,
    ],
    content: value,
    editable: !readOnly,
    onUpdate: handleUpdate,
  })

  if (!editor) return null

  if (readOnly) {
    return (
      <div
        className={`rich-text-editor rich-text-editor--readonly rounded-lg border border-[var(--crm-border-subtle)] bg-[var(--crm-bg-page)] p-4 ${className}`}
        style={{ minHeight }}
      >
        <div
          className="tiptap-content prose prose-sm max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: processedValue }}
        />
      </div>
    )
  }

  const insertVariable = (v: Variable) => {
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'variable',
        attrs: { key: v.key, label: v.label },
      })
      .run()
  }

  const setLink = (url: string) => {
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    setShowLinkDialog(false)
  }

  const removeLink = () => {
    editor.chain().focus().unsetLink().run()
    setShowLinkDialog(false)
  }

  const insertImage = (url: string, alt: string) => {
    editor.chain().focus().setImage({ src: url, alt }).run()
    setShowImageDialog(false)
  }

  const currentLinkUrl = editor.isActive('link')
    ? (editor.getAttributes('link').href as string)
    : undefined

  return (
    <div
      className={`rich-text-editor overflow-hidden rounded-lg border border-[var(--crm-border)] bg-[var(--crm-bg-card)] focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 ${className}`}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[var(--crm-border)] bg-[var(--crm-bg-subtle)] px-2 py-1">
        {/* Text formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Đậm"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Nghiêng"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Gạch chân"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Gạch ngang"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Tiêu đề 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Tiêu đề 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Tiêu đề 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Lists + HR */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Danh sách"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Danh sách số"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Đường kẻ ngang"
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="Căn trái"
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="Căn giữa"
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="Căn phải"
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Link */}
        <div className="relative">
          <ToolbarButton
            onClick={() => {
              setShowLinkDialog(!showLinkDialog)
              setShowImageDialog(false)
              setShowVariables(false)
            }}
            active={editor.isActive('link')}
            title="Liên kết"
          >
            <LinkIcon className="h-4 w-4" />
          </ToolbarButton>
          {showLinkDialog && (
            <LinkDialog
              initialUrl={currentLinkUrl}
              onSubmit={setLink}
              onRemove={editor.isActive('link') ? removeLink : undefined}
              onCancel={() => setShowLinkDialog(false)}
            />
          )}
        </div>

        {/* Image */}
        <div className="relative">
          <ToolbarButton
            onClick={() => {
              setShowImageDialog(!showImageDialog)
              setShowLinkDialog(false)
              setShowVariables(false)
            }}
            title="Hình ảnh"
          >
            <ImageIcon className="h-4 w-4" />
          </ToolbarButton>
          {showImageDialog && (
            <ImageDialog
              onSubmit={insertImage}
              onCancel={() => setShowImageDialog(false)}
            />
          )}
        </div>

        {/* Variables */}
        {variables && variables.length > 0 && (
          <>
            <ToolbarSeparator />
            <div className="relative">
              <ToolbarButton
                onClick={() => {
                  setShowVariables(!showVariables)
                  setShowLinkDialog(false)
                  setShowImageDialog(false)
                }}
                title="Chèn biến"
              >
                <Code2 className="h-4 w-4" />
              </ToolbarButton>
              {showVariables && (
                <VariableDropdown
                  variables={variables}
                  onSelect={insertVariable}
                  onClose={() => setShowVariables(false)}
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* Editor content */}
      <div
        className="tiptap-content"
        style={{ minHeight, maxHeight, overflowY: 'auto' }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
