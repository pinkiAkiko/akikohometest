declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description?: string
  order_id: string
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  theme?: {
    color?: string
  }
  handler: (response: RazorpaySuccessResponse) => void
  modal?: {
    ondismiss?: () => void
    escape?: boolean
  }
}

interface RazorpayInstance {
  open(): void
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

let scriptLoaded = false

/** Inject the Razorpay Checkout.js script once (idempotent) */
export function loadRazorpayScript(): Promise<void> {
  if (scriptLoaded || (typeof window !== "undefined" && window.Razorpay)) {
    scriptLoaded = true
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    script.onload = () => {
      scriptLoaded = true
      resolve()
    }
    script.onerror = () => reject(new Error("Failed to load Razorpay Checkout script"))
    document.head.appendChild(script)
  })
}

/**
 * Open the Razorpay Checkout modal.
 * Resolves with the payment response on success, rejects when the user dismisses.
 */
export function openRazorpayCheckout(params: {
  orderId: string
  keyId: string
  amountPaise: number
  currency?: string
  prefill?: { name?: string; email?: string; contact?: string }
}): Promise<RazorpaySuccessResponse> {
  return new Promise((resolve, reject) => {
    const options: RazorpayOptions = {
      key: params.keyId,
      amount: params.amountPaise,
      currency: params.currency ?? "INR",
      name: "Akiko Home",
      description: "Premium Home Textiles",
      order_id: params.orderId,
      prefill: params.prefill ?? {},
      theme: { color: "#1a1a1a" },
      handler: (response) => resolve(response),
      modal: {
        escape: false,
        ondismiss: () => reject(new Error("Payment cancelled")),
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  })
}
