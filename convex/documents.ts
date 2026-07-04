import {v} from 'convex/values'

import {mutation,query} from './_generated/server'
import {Doc,Id} from './_generated/dataModel'
import {buildSearchText, extractSearchTextFromContent, getMatchSnippetForPhrase, getMatchSnippetForTerms, matchesAllSearchTerms, matchesPhrase, parseSearchTerms} from './lib/searchText'

export const archive = mutation({
  args:{id:v.id("documents")},
  handler:async (context,args) => {
   const identity = await context.auth.getUserIdentity()

    if (!identity) {
      throw new Error("Not authenticated")
    }

    const userId = identity.subject
    
    const existingDocument = await context.db.get(args.id)

    if (!existingDocument) {
      throw new Error('Not found')
    }

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized")
    }

    const recursiveArchive = async (documentId:Id<'documents'>) => {
      const children = await context.db
      .query('documents')
      .withIndex("by_user_parent",q => (
        q.eq("userId",userId).eq('parentDocument',documentId)
      ))
      .collect()
    
      for (const child of children) {
        await context.db.patch(child._id,{
          isArchived:true
        })
        await recursiveArchive(child._id)
      }
    }

    const document = await context.db.patch(args.id,{
      isArchived:true
    })

    recursiveArchive(args.id)

    return document
  }
})

export const getSidebar = query({
  args:{
    parentDocument:v.optional(v.id("documents"))
  },
  handler:async (context,args) => {
    const identity = await context.auth.getUserIdentity()

    if (!identity) {
      throw new Error("Not authenticated")
    }

    const userId = identity.subject

    const documents = await context.db
    .query("documents")
    .withIndex("by_user_parent",(q) => q.eq('userId',userId)
    .eq('parentDocument',args.parentDocument))
    .filter(q => q.eq(q.field("isArchived"),false))
    .order('desc')
    .collect()

    return documents
  }
})

export const create = mutation({
  args:{
    title:v.string(),
    parentDocument:v.optional(v.id('documents'))
  },
  handler:async (context,args) => {
    const identity = await context.auth.getUserIdentity()

    if (!identity) {
      throw new Error('Not authenticated')
    }

    const userId = identity.subject

    const document = await context.db.insert('documents',{
      title:args.title,
      parentDocument:args.parentDocument,
      userId,
      isArchived:false,
      isPublished:false,
      searchText: buildSearchText(args.title),
    })

    return document
  }
})

export const getTrash = query({
  handler:async (context) => {
    const identity = await context.auth.getUserIdentity()

    if (!identity) {
      throw new Error('Not authenticated')
    }

    const userId = identity.subject

    const documents = await context.db.query('documents')
    .withIndex('by_user',q => q.eq('userId',userId))
    .filter(q => q.eq(q.field('isArchived'),true))
    .order('desc')
    .collect()

    return documents
  }
})

export const restore = mutation({
  args:{id:v.id('documents')},
  handler: async (context,args) => {
    const identity = await context.auth.getUserIdentity()

    if (!identity) {
      throw new Error('Not authenticated')
    }

    const userId = identity.subject

    const existingDocument = await context.db.get(args.id)

    if (!existingDocument) {
      throw new Error('Not found')
    }

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized")
    }

    const recursiveRestore = async (documentId:Id<'documents'>) => {
      const children = await context.db.query('documents')
      .withIndex('by_user_parent',q => (
        q.eq('userId',userId).eq('parentDocument',documentId)
      ))
      .collect()

      for (const child of children) {
        await context.db.patch(child._id,{
          isArchived:false
        })

        await recursiveRestore(child._id)
      }
    }

    const options:Partial<Doc<'documents'>> = {
      isArchived:false
    }

    if (existingDocument.parentDocument) {
      const parent = await context.db.get(existingDocument.parentDocument)
      if (parent?.isArchived) {
        options.parentDocument = undefined
      }
    }

    const document = await context.db.patch(args.id,options)

    recursiveRestore(args.id)

    return document
  }
})


export const remove = mutation({
  args:{id:v.id('documents')},
  handler:async (context,args) => {

    const identity = await context.auth.getUserIdentity()

    if (!identity) {
      throw new Error('Not authenticated')
    }

    const userId = identity.subject

    const existingDocument = await context.db.get(args.id)

    if (!existingDocument) {
      throw new Error('Not found')
    }

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized")
    }

    const document = await context.db.delete(args.id)

    return document
  }
})

export const getSearch = query({
  args: {
    query: v.optional(v.string()),
    mode: v.optional(v.union(v.literal("words"), v.literal("phrase"))),
  },
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity()

    if (!identity) {
      throw new Error('Not authenticated')
    }

    const userId = identity.subject

    const documents = await context.db
      .query('documents')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) => q.eq(q.field('isArchived'), false))
      .order('desc')
      .collect()

    const searchQuery = args.query?.trim()
    const searchTerms = searchQuery ? parseSearchTerms(searchQuery) : []
    const searchMode = args.mode ?? "words"

    if (searchTerms.length === 0) {
      return documents.map((doc) => ({
        _id: doc._id,
        title: doc.title,
        icon: doc.icon,
        snippet: undefined as string | undefined,
      }))
    }

    return documents
      .filter((doc) => {
        const haystack =
          doc.searchText ?? buildSearchText(doc.title, doc.content)

        if (searchMode === "phrase") {
          return searchQuery ? matchesPhrase(haystack, searchQuery) : true
        }

        return matchesAllSearchTerms(haystack, searchTerms)
      })
      .map((doc) => {
        const bodyText = extractSearchTextFromContent(doc.content)
          .replace(/\s+/g, " ")
          .trim()
        const bodyLower = bodyText.toLowerCase()
        const normalizedQuery = searchQuery!.toLowerCase()

        let snippet: string | undefined

        if (searchMode === "phrase") {
          snippet = bodyLower.includes(normalizedQuery)
            ? getMatchSnippetForPhrase(bodyText, searchQuery!)
            : undefined
        } else {
          const bodyHasMatch = searchTerms.some((term) => bodyLower.includes(term))
          snippet = bodyHasMatch
            ? getMatchSnippetForTerms(bodyText, searchTerms)
            : undefined
        }

        return {
          _id: doc._id,
          title: doc.title,
          icon: doc.icon,
          snippet,
        }
      })
  },
})

export const getById = query({
  args:{documentId:v.id('documents')},
  handler:async (context,args) => {
    const identity = await context.auth.getUserIdentity()

    const document = await context.db.get(args.documentId)

    if (!document) {
      throw new Error("Not found")
    }

    if (document.isPublished && !document.isArchived) {
      return document
    }

    if (!identity) {
      throw new Error("Not authenticated")
    }

    const userId = identity.subject

    if (document.userId !== userId)  {
      throw new Error("Unauthorized")
    }
    
    return document
  }
})


export const update = mutation({
  args:{
    id:v.id('documents'),
    title:v.optional(v.string()),
    content:v.optional(v.string()),
    coverImage:v.optional(v.string()),
    icon:v.optional(v.string()),
    isPublished:v.optional(v.boolean())
  },
  handler:async (context,args) => {
    const identity = await context.auth.getUserIdentity()

    if (!identity) {
      throw new Error("Unauthenticated")
    }

    const userId = identity.subject

    const {id,...rest} = args

    const existingDocument = await context.db.get(args.id)

    if (!existingDocument) {
      throw new Error("Not found")
    }

    if (existingDocument.userId !== userId) {
      throw new Error('Unauthorized')
    }

    const nextTitle = rest.title ?? existingDocument.title
    const nextContent = rest.content ?? existingDocument.content
    const searchText =
      rest.title !== undefined || rest.content !== undefined
        ? buildSearchText(nextTitle, nextContent)
        : undefined

    const document = await context.db.patch(args.id, {
      ...rest,
      ...(searchText !== undefined ? { searchText } : {}),
    })

    return document
  },
})


export const removeIcon = mutation({
  args:{id:v.id('documents')},
  handler:async (context,args) => {
    const identity = await context.auth.getUserIdentity()

    if (!identity) {
      throw new Error("Unauthenticated")
    }

    const userId = identity.subject

     const existingDocument = await context.db.get(args.id)

    if (!existingDocument) {
      throw new Error('Not found')
    }

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized")
    }

    const document = await context.db.patch(args.id,{
      icon:undefined
    })

    return document
  } 
})

export const removeCoverImage = mutation({
  args:{id:v.id('documents')},
  handler:async (context,args) => {
    const identity = await context.auth.getUserIdentity()

    if (!identity) {
      throw new Error("Unauthenticated")
    }

    const userId = identity.subject

    const existingDocument = await context.db.get(args.id)

    if (!existingDocument) {
      throw new Error('Not found')
    }

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized")
    }

    const document = await context.db.patch(args.id,{
      coverImage:undefined
    })

    return document
  }
})

export const backfillSearchText = mutation({
  handler: async (context) => {
    const identity = await context.auth.getUserIdentity()

    if (!identity) {
      throw new Error('Not authenticated')
    }

    const userId = identity.subject

    const documents = await context.db
      .query('documents')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect()

    let updated = 0

    for (const doc of documents) {
      if (!doc.searchText) {
        await context.db.patch(doc._id, {
          searchText: buildSearchText(doc.title, doc.content),
        })
        updated++
      }
    }

    return { updated }
  },
})