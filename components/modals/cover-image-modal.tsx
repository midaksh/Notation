'use client'	

import { useState } from "react"
import { useMutation } from "convex/react"
import { useParams } from "next/navigation"
import {Dialog,DialogContent,DialogHeader} from '@/components/ui/dialog'
import { useConverImage } from "@/hooks/use-cover-image"
import { useEdgeStoreEnabled } from "@/components/providers/optional-edgestore-provider"
import { SingleImageDropzone } from "@/components/single-image-dropzone"
import { useEdgeStore } from "@/lib/edgestore"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

function CoverImageModalContent () {
  const params = useParams()
  const update = useMutation(api.documents.update)
  const [file,setFile] = useState<File>()
  const [isSubmitting,setIsSubmitting] = useState(false)
  const coverImage = useConverImage()
  const {edgestore} = useEdgeStore()

  const onClose = () => {
    setFile(undefined)
    setIsSubmitting(false)
    coverImage.onClose()
  }

  const onChange = async (file?:File) => {
    if (file) {
      setIsSubmitting(true)
      setFile(file)

      const response = await edgestore.publicFiles.upload({
          file,
          options:{
            replaceTargetUrl:coverImage.url
          }
        })
    

      await update({
        id:params.documentId as Id<'documents'>,
        coverImage:response.url
      })

      onClose()
    }
  }

return (
    <Dialog open={coverImage.isOpen} onOpenChange={coverImage.onClose}>
      <DialogContent>
        <DialogHeader>
          <h2 className="text-center text-lg font-semibold">
            Cover Image
          </h2>
        </DialogHeader>
        <SingleImageDropzone className="w-full outline-none"
        disabled={isSubmitting}
        value={file}
        onChange={onChange}/>
      </DialogContent>
    </Dialog>
)
}

function CoverImageModalUnavailable () {
  const coverImage = useConverImage()

  return (
    <Dialog open={coverImage.isOpen} onOpenChange={coverImage.onClose}>
      <DialogContent>
        <DialogHeader>
          <h2 className="text-center text-lg font-semibold">
            Cover Image
          </h2>
        </DialogHeader>
        <p className="text-center text-sm text-muted-foreground py-6">
          Image uploads are not configured yet. Add your EdgeStore keys to <code className="text-xs">.env.local</code> to enable cover images.
        </p>
      </DialogContent>
    </Dialog>
  )
}

export function CoverImageModal () {
  const edgeStoreEnabled = useEdgeStoreEnabled()

  if (!edgeStoreEnabled) {
    return <CoverImageModalUnavailable />
  }

  return <CoverImageModalContent />
}
