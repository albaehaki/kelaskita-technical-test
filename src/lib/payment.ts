/**
 * Payment gateway — Strategy Pattern.
 *
 * Aplikasi tidak tahu provider mana yang aktif. Semua lewat interface
 * PaymentProvider, dipilih saat runtime dari env PAYMENT_PROVIDER.
 * Menambah provider baru (Xendit/Tripay) = tambah 1 class, tanpa ubah route.
 */

export type PaymentInit = {
  invoiceNo: string;
  amount: number;
  itemName: string;
  customer: { name: string; email: string; phone: string };
};

export type PaymentInitResult = {
  provider: string;
  reference: string;
  redirectUrl: string;
  raw: unknown;
};

export interface PaymentProvider {
  readonly name: string;
  createPayment(input: PaymentInit): Promise<PaymentInitResult>;
}

/** Mock gateway: membuat halaman pembayaran internal, tanpa akun pihak ketiga. */
export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock";

  async createPayment(input: PaymentInit): Promise<PaymentInitResult> {
    return {
      provider: this.name,
      reference: `MOCK-${input.invoiceNo}`,
      redirectUrl: `/bayar/${input.invoiceNo}`,
      raw: { simulated: true },
    };
  }
}

/** Midtrans Snap sandbox. Aktif hanya jika PAYMENT_PROVIDER=midtrans + key terisi. */
export class MidtransPaymentProvider implements PaymentProvider {
  readonly name = "midtrans";

  constructor(
    private readonly serverKey: string,
    private readonly production = false
  ) {}

  async createPayment(input: PaymentInit): Promise<PaymentInitResult> {
    const base = this.production
      ? "https://app.midtrans.com/snap/v1/transactions"
      : "https://app.sandbox.midtrans.com/snap/v1/transactions";

    const res = await fetch(base, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${Buffer.from(`${this.serverKey}:`).toString("base64")}`,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: input.invoiceNo,
          gross_amount: input.amount,
        },
        item_details: [
          { id: input.invoiceNo, price: input.amount, quantity: 1, name: input.itemName.slice(0, 50) },
        ],
        customer_details: {
          first_name: input.customer.name,
          email: input.customer.email,
          phone: input.customer.phone,
        },
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Midtrans error ${res.status}: ${text.slice(0, 200)}`);
    }

    const data = (await res.json()) as { token: string; redirect_url: string };

    return {
      provider: this.name,
      reference: `MIDTRANS-${input.invoiceNo}`,
      redirectUrl: data.redirect_url,
      raw: data,
    };
  }
}

/** Xendit Invoice API (sandbox maupun production, ditentukan oleh key). */
export class XenditPaymentProvider implements PaymentProvider {
  readonly name = "xendit";

  constructor(private readonly secretKey: string) {}

  async createPayment(input: PaymentInit): Promise<PaymentInitResult> {
    const appUrl = process.env.APP_URL ?? "http://localhost:3015";

    const res = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${this.secretKey}:`).toString("base64")}`,
      },
      body: JSON.stringify({
        external_id: input.invoiceNo,
        amount: input.amount,
        payer_email: input.customer.email,
        description: input.itemName.slice(0, 200),
        customer: {
          given_names: input.customer.name,
          email: input.customer.email,
          mobile_number: input.customer.phone,
        },
        success_redirect_url: `${appUrl}/invoice/${input.invoiceNo}`,
        failure_redirect_url: `${appUrl}/invoice/${input.invoiceNo}`,
        invoice_duration: 86400,
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Xendit error ${res.status}: ${text.slice(0, 200)}`);
    }

    const data = (await res.json()) as { id: string; invoice_url: string };

    return {
      provider: this.name,
      reference: data.id,
      redirectUrl: data.invoice_url,
      raw: data,
    };
  }
}

export function getPaymentProvider(): PaymentProvider {
  const mode = process.env.PAYMENT_PROVIDER?.trim().toLowerCase();

  if (mode === "xendit") {
    const key = process.env.XENDIT_SECRET_KEY?.trim();
    if (!key) throw new Error("PAYMENT_PROVIDER=xendit tapi XENDIT_SECRET_KEY kosong");
    return new XenditPaymentProvider(key);
  }

  const key = process.env.MIDTRANS_SERVER_KEY?.trim();

  if (mode === "midtrans" && key) {
    return new MidtransPaymentProvider(key, process.env.MIDTRANS_IS_PRODUCTION === "true");
  }
  return new MockPaymentProvider();
}
