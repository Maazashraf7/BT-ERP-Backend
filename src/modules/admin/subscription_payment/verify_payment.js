import crypto from "crypto";
import prisma from "../../../core/config/db.js";
import { razorpay } from "../../../core/config/razorpay_config.js";

/**
 * 👑 Create Razorpay Order for Subscription
 * POST /api/v1/subscription-payment/create-order
 */
export const createSubscriptionOrder = async (req, res) => {
    try {
        const { planId } = req.body;
        if (!planId) {
            return res.status(400).json({ success: false, message: "planId is required" });
        }

        const plan = await prisma.subscription_Plan.findUnique({
            where: { id: planId },
        });

        if (!plan || !plan.isActive) {
            return res.status(404).json({ success: false, message: "Active subscription plan not found" });
        }

        // Razorpay amount is in paise
        const amount = Math.round(plan.price * 100);

        const options = {
            amount,
            currency: "INR",
            receipt: `receipt_plan_${planId}_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            key: process.env.RAZORPAY_KEY_ID,
            planName: plan.name
        });

    } catch (error) {
        console.error("CREATE RAZORPAY ORDER ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to create payment order" });
    }
};

/**
 * 👑 Verify Payment and Activate Subscription
 * POST /api/v1/subscription-payment/verify
 */
export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            planId,
        } = req.body;

        // From authMiddleware
        const tenantId = req.user.tenantId || req.user.id;

        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !planId) {
            return res.status(400).json({ success: false, message: "Missing required payment details" });
        }

        // 1. Signature Verification
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Payment signature verification failed" });
        }

        // 2. Fetch Plan Details
        const plan = await prisma.subscription_Plan.findUnique({
            where: { id: planId },
        });

        if (!plan) {
            return res.status(404).json({ success: false, message: "Subscription plan not found" });
        }

        // 3. Update Tenant and Create Plan History (Transaction)
        const result = await prisma.$transaction(async (tx) => {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + (plan.duration || 30));

            const updatedTenant = await tx.tenant.update({
                where: { id: tenantId },
                data: {
                    subscription_planId: planId,
                    subscription_plan_start_date: startDate,
                    subscription_plan_end_date: endDate,
                    isActive: true, // Activate tenant on payment
                    is_plan_assigned: true,
                },
            });

            const history = await tx.tenantPlanHistory.create({
                data: {
                    tenant_id: tenantId,
                    subscription_plan_id: planId,
                    plan_name: plan.name,
                    expires_at: endDate,
                    status: "ACTIVE",
                    // We can store payment info in meta if needed, though schema doesn't have paymentId
                },
            });

            return { updatedTenant, history };
        });

        res.json({
            success: true,
            message: "Payment verified and subscription activated successfully",
            tenant: {
                id: result.updatedTenant.id,
                plan: plan.name,
                expiry: result.updatedTenant.subscription_plan_end_date
            }
        });

    } catch (error) {
        console.error("VERIFY PAYMENT ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to verify payment and activate subscription" });
    }
};
