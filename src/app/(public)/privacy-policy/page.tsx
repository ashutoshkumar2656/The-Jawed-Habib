import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import { ShieldCheck, Calendar, Phone, Lock, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | The Jawed Habib Salon Lalganj",
  description:
    "Official Privacy Policy for The Jawed Habib Salon in Lalganj, Bihar. Understand how we collect, use, and protect your contact, booking, and payment reference data.",
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy | The Jawed Habib Salon Lalganj",
    description:
      "Learn how client personal data, appointment details, and payment transaction identifiers are securely processed and protected at The Jawed Habib Salon in Lalganj.",
    url: "https://www.thejawedhabibsalons.in/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-salon-black text-salon-ivory py-16">
      <div className="container mx-auto px-4 max-w-4xl space-y-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Privacy Policy", href: "/privacy-policy" },
          ]}
        />

        <div className="space-y-4 border-b border-zinc-800 pb-8">
          <Badge variant="gold">
            <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
            Client Privacy &amp; Data Protection
          </Badge>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Last Updated: November 2026 • The Jawed Habib Salon, 1st Floor, Tinpulwa Chowk, Lalganj, Vaishali, Bihar – 844121
          </p>
        </div>

        <div className="space-y-10 text-xs sm:text-sm leading-relaxed text-zinc-300 font-light">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              1. Overview &amp; Commitment to Privacy
            </h2>
            <p>
              At <strong>{BRAND_CONFIG.fullName}</strong> (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;), we respect your personal privacy and are committed to safeguarding the data you share when using our website (<strong>https://www.thejawedhabibsalons.in</strong>), booking salon appointments, or communicating with our front desk. This Privacy Policy outlines what information we collect, how it is handled, and how your privacy is protected.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              2. Information We Collect
            </h2>
            <p>We collect only the information necessary to fulfill salon services and manage reservations:</p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
              <li>
                <strong className="text-zinc-200">Personal Contact Details:</strong> Full name, 10-digit mobile phone number, and optional email address provided during booking or contact inquiry.
              </li>
              <li>
                <strong className="text-zinc-200">Appointment &amp; Service Preferences:</strong> Requested service(s), package selection, preferred date and time slot, stylist preference, and any specific styling notes or bridal requirements.
              </li>
              <li>
                <strong className="text-zinc-200">Contact Form Inquiries:</strong> Name, phone number, selected area of interest, and custom message text submitted through our front desk inquiry form.
              </li>
              <li>
                <strong className="text-zinc-200">Transaction Identifiers:</strong> Non-sensitive transaction references, such as Razorpay Order ID (e.g., <code>order_xxxx</code>), Razorpay Payment ID (e.g., <code>pay_xxxx</code>), payment method (e.g., UPI, card brand), payment status, and amount paid.
              </li>
              <li>
                <strong className="text-zinc-200">Technical Server Logs:</strong> IP address, browser user-agent, timestamp, and referring URL generated automatically when accessing our web application for security and rate-limiting purposes.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              3. Purpose &amp; Use of Collected Information
            </h2>
            <p>Your information is used strictly for legitimate salon operations:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li>Scheduling, confirming, and managing your salon appointments and bridal suite bookings.</li>
              <li>Dispatching transactional confirmations, reminder messages, and digital invoices via SMS, WhatsApp, or email.</li>
              <li>Enabling front desk staff to verify your booking when you arrive at our Lalganj salon.</li>
              <li>Maintaining service history and loyalty reward records.</li>
              <li>Responding directly to customer service inquiries or consultation requests.</li>
              <li>Protecting the website against automated spam, card-testing attacks, and denial-of-service attempts.</li>
            </ul>
            <p className="text-salon-goldLight font-medium">
              We do not sell, rent, lease, or trade your personal telephone numbers or booking details to any third-party marketing companies.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              4. Payment Processing Architecture &amp; Cardholder Data Boundary
            </h2>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 space-y-3">
              <div className="flex items-center gap-2 text-salon-gold font-serif font-bold text-sm">
                <Lock className="h-4 w-4" />
                <span>Zero Card Data Stored on Salon Servers</span>
              </div>
              <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                When you make an online advance payment, transaction processing is handled entirely by <strong>Razorpay Software Private Limited</strong> through an encrypted, PCI-DSS Level 1 compliant Standard Checkout modal.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-zinc-400">
                <li>
                  <strong className="text-white">Our salon servers NEVER receive, process, or store</strong> complete credit/debit card numbers, CVVs, expiry dates, netbanking passwords, or UPI PINs.
                </li>
                <li>
                  Payment data is entered directly into Razorpay&apos;s secure hosted fields governed by Razorpay&apos;s security and privacy standards.
                </li>
                <li>
                  Our database receives only tokenized confirmation records (Payment ID, Order ID, status, and authorized amount in paise) necessary for invoice generation and booking confirmation.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              5. Third-Party Service Providers
            </h2>
            <p>We engage trusted infrastructure service providers to operate our digital platform:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li><strong>Razorpay:</strong> Payment gateway and transaction settlement.</li>
              <li><strong>Neon PostgreSQL:</strong> Encrypted cloud database hosting for salon bookings and CRM records.</li>
              <li><strong>Vercel:</strong> Web hosting and serverless computing infrastructure.</li>
              <li><strong>Cloudinary:</strong> Content delivery network for salon hairstyle, transformation, and interior media.</li>
            </ul>
            <p>All third-party providers are bound by strict confidentiality and data protection obligations.</p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              6. Data Security &amp; Technical Safeguards
            </h2>
            <p>
              We implement industry-standard administrative, physical, and technical controls:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li>All web traffic is transmitted via TLS 1.3 encrypted HTTPS.</li>
              <li>API secrets and payment gateway configuration in our database are encrypted using authenticated AES-256-GCM encryption.</li>
              <li>Admin portal access is restricted via Role-Based Access Control (RBAC) with cryptographic session cookies.</li>
              <li>All incoming Razorpay webhook payloads are verified using constant-time HMAC-SHA256 signature verification.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              7. Data Retention Policy
            </h2>
            <p>
              We retain customer appointment records and transaction logs for as long as necessary to fulfill salon accounting, tax compliance, dispute resolution, and warranty obligations under Indian law. Inactive contact records may be archived or anonymized in accordance with salon data maintenance routines.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              8. Customer Rights &amp; Data Requests
            </h2>
            <p>
              As a valued client, you have the right to request access to the personal data we hold about you, request correction of inaccurate phone numbers or names, or request removal of non-essential profile details. To exercise these rights, please contact our salon reception desk with your phone number and valid identification.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              9. Cookies &amp; Local Storage
            </h2>
            <p>
              Our website uses strictly necessary session cookies and local storage tokens to maintain administrator login states and prevent cross-site request forgery (CSRF). We do not deploy third-party behavioral advertising cookies or cross-site tracking pixels on this website.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              10. Contacting Us About Privacy
            </h2>
            <p>
              If you have any questions or concerns regarding this Privacy Policy or how your information is handled, please contact our Salon Manager:
            </p>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-1.5 text-xs">
              <p><strong className="text-white">{BRAND_CONFIG.fullName}</strong></p>
              <p className="text-zinc-300">{BRAND_CONFIG.location.fullAddress}</p>
              <p><strong className="text-white">Phone:</strong> +91 {BRAND_CONFIG.contact.primaryPhone} / +91 {BRAND_CONFIG.contact.secondaryPhone}</p>
              {BRAND_CONFIG.contact.email && (
                <p><strong className="text-white">Email:</strong> {BRAND_CONFIG.contact.email}</p>
              )}
            </div>
          </section>

          {/* Section 11 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              11. Policy Revisions
            </h2>
            <p>
              We may update this Privacy Policy from time to time to accommodate new salon features or legal obligations. Updated policies will be posted on this page with an amended &quot;Last Updated&quot; date. We encourage clients to periodically review this page.
            </p>
          </section>
        </div>

        <div className="pt-8 border-t border-zinc-800 flex flex-wrap gap-4 items-center justify-between">
          <Link href="/">
            <Button variant="outline" size="sm">
              ← Return to Homepage
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/terms-and-conditions">
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white text-xs">
                Terms &amp; Conditions →
              </Button>
            </Link>
            <Link href="/cancellation-refund-policy">
              <Button variant="gold" size="sm" className="text-xs">
                Cancellation &amp; Refund Policy →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
