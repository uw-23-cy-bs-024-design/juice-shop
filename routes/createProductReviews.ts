import { type Request, type Response } from 'express'
import * as challengeUtils from '../lib/challengeUtils'
import { reviewsCollection } from '../data/mongodb'
import { challenges } from '../data/datacache'
import * as security from '../lib/insecurity'
import * as utils from '../lib/utils'

export function createProductReviews () {
  return async (req: Request, res: Response) => {
    const user = security.authenticatedUsers.from(req)

    challengeUtils.solveIf(
      challenges.forgedReviewChallenge,
      () => user?.data?.email !== req.body.author
    )

    try {
      // ✅ Sanitize and validate inputs
      const productId = String(req.params.id).trim()
      const message = String(req.body.message).trim()
      const author = String(req.body.author).trim()

      // ✅ Only allow expected fields
      const reviewDoc = {
        product: productId,
        message,
        author,
        likesCount: 0,
        likedBy: []
      }

      await reviewsCollection.insertOne(reviewDoc)

      return res.status(201).json({ status: 'success' })
    } catch (err: unknown) {
      return res.status(500).json(utils.getErrorMessage(err))
    }
  }
}
