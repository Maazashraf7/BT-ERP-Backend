import { Router } from "express";
import {
    createSubscriptionOrder,
    verifyPayment,
    createSubscriptionQr,
    checkPaymentStatus
} from "./verify_payment.js";
import { authMiddleware } from "../../../core/middlewares/auth.middleware.js";

const router = Router();

// Protect all payment routes - user must be logged in as Tenant
router.use(authMiddleware);

/**
 * @route POST /api/v1/subscription-payment/create-order
 * @desc Create a Razorpay order for a subscription plan
 */
router.post("/create-order", createSubscriptionOrder);

/**
 * @route POST /api/v1/subscription-payment/verify
 * @desc Verify Razorpay payment signature and activate plan
 */
router.post("/verify", verifyPayment);

/**
 * @route POST /api/v1/subscription-payment/create-qr
 * @desc Create a static QR Code for Subscription
 */
router.post("/create-qr", createSubscriptionQr);

/**
 * @route GET /api/v1/subscription-payment/check-status/:qrId
 * @desc Check QR payment status (Polling)
 */
router.get("/check-status/:qrId", checkPaymentStatus);

export default router;
