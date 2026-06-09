'use client'	

import {BlockNoteEditor,PartialBlock} from '@blocknote/core'
import {BlockNoteView,useBlockNote} from '@blocknote/react'
import '@blocknote/core/style.css'
import { useTheme } from "next-themes"

import { useEdgeStoreEnabled } from "@/components/providers/optional-edgestore-provider"
import { useEdgeStore } from "@/lib/edgestore"

interface EditorProps{
  onChange:(value:string) => void
  initialContent?:string
  editable?:boolean
}

function EditorContent ({
  onChange,
  initialContent,
  editable,
  uploadFile,
}: EditorProps & { uploadFile?: (file: File) => Promise<string> }) {
  const { resolvedTheme } = useTheme()

  const editor: BlockNoteEditor = useBlockNote({
    editable,
    initialContent: initialContent ? JSON.parse(initialContent) as PartialBlock[] : undefined,
    onEditorContentChange: (editor) => {
      onChange(JSON.stringify(editor.topLevelBlocks, null, 2))
    },
    uploadFile,
  })

  return (
    <div>
      <BlockNoteView editor={editor} theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />
    </div>
  )
}

function EditorWithUpload (props: EditorProps) {
  const { edgestore } = useEdgeStore()

  const handleUpload = async (file: File) => {
    const response = await edgestore.publicFiles.upload({ file })
    return response.url
  }

  return <EditorContent {...props} uploadFile={handleUpload} />
}

function Editor ({ onChange, initialContent, editable }: EditorProps) {
  const edgeStoreEnabled = useEdgeStoreEnabled()

  if (edgeStoreEnabled) {
    return (
      <EditorWithUpload
        onChange={onChange}
        initialContent={initialContent}
        editable={editable}
      />
    )
  }

  return (
    <EditorContent
      onChange={onChange}
      initialContent={initialContent}
      editable={editable}
    />
  )
}

export default Editor
