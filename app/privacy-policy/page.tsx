"use client";

import Container from "@/components/layout/Container";

export default function PrivacyPolicyPage() {
  return (
    <Container>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Introduction</h2>
          <p className="mb-4">
            At VinaHome, we are committed to protecting your privacy and
            ensuring the security of your personal information. This Privacy
            Policy explains how we collect, use, and safeguard your information
            when you use our platform.
          </p>
          <p>
            By using VinaHome, you agree to the collection and use of
            information in accordance with this policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Information We Collect</h2>
          <p className="mb-4">
            We collect several types of information for various purposes:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Personal Information</strong>: When you register for an
              account, we collect your name, email address, phone number, and
              other contact information.
            </li>
            <li>
              <strong>Property Search Information</strong>: We collect data
              about your property searches, including location preferences,
              property types, price ranges, and other search criteria.
            </li>
            <li>
              <strong>Usage Data</strong>: We collect information about how you
              interact with our platform, including pages visited, time spent on
              each page, and features used.
            </li>
            <li>
              <strong>Device Information</strong>: We collect information about
              your device, including IP address, browser type, and operating
              system.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            How We Use Your Information
          </h2>
          <p className="mb-4">
            We use the collected information for various purposes:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide and maintain our service</li>
            <li>
              To personalize your experience and show you relevant property
              listings
            </li>
            <li>To communicate with you about our services and updates</li>
            <li>To process transactions and manage your account</li>
            <li>To analyze and improve our platform</li>
            <li>To detect, prevent, and address technical issues</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Data Security</h2>
          <p>
            The security of your data is important to us. We implement
            appropriate security measures to protect your personal information.
            However, please be aware that no method of transmission over the
            Internet or method of electronic storage is 100% secure. While we
            strive to use commercially acceptable means to protect your personal
            information, we cannot guarantee its absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Sharing Your Information
          </h2>
          <p className="mb-4">We may share your information with:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Property Owners/Agents</strong>: When you express interest
              in a property, your contact information may be shared with the
              property owner or agent to facilitate communication.
            </li>
            <li>
              <strong>Service Providers</strong>: We may share your information
              with third-party service providers who perform services on our
              behalf, such as payment processing, data analysis, and customer
              service.
            </li>
            <li>
              <strong>Legal Requirements</strong>: We may disclose your
              information if required by law or in response to valid requests by
              public authorities.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Rights</h2>
          <p className="mb-4">
            You have the following rights regarding your personal information:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>The right to access, update, or delete your information</li>
            <li>
              The right to rectification if your information is inaccurate or
              incomplete
            </li>
            <li>The right to object to our processing of your personal data</li>
            <li>
              The right to request restriction of processing your personal
              information
            </li>
            <li>The right to data portability</li>
            <li>The right to withdraw consent</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Cookies</h2>
          <p>
            We use cookies and similar tracking technologies to track activity
            on our platform and hold certain information. Cookies are files with
            a small amount of data which may include an anonymous unique
            identifier. You can instruct your browser to refuse all cookies or
            to indicate when a cookie is being sent. However, if you do not
            accept cookies, you may not be able to use some portions of our
            service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Changes to This Privacy Policy
          </h2>
          <p className="mb-4">
            We may update our Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page.
            You are advised to review this Privacy Policy periodically for any
            changes. Changes to this Privacy Policy are effective when they are
            posted on this page.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at privacy@vinahome.com.
          </p>
        </section>
      </div>
    </Container>
  );
}
