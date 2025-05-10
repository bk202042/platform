"use client";

import Container from "@/components/layout/Container";

export default function TermsOfUsePage() {
  return (
    <Container>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Terms of Use</h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Introduction</h2>
          <p className="mb-4">
            Welcome to VinaHome. By accessing or using our platform, you agree
            to be bound by these Terms of Use. Please read these terms carefully
            before using our services.
          </p>
          <p>
            If you do not agree with any part of these terms, you may not access
            or use our platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Definitions</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Platform</strong>: The VinaHome website and services.
            </li>
            <li>
              <strong>User</strong>: Any individual who accesses or uses the
              Platform.
            </li>
            <li>
              <strong>Content</strong>: Any information, text, graphics, photos,
              or other materials uploaded, downloaded, or appearing on the
              Platform.
            </li>
            <li>
              <strong>Property Listing</strong>: Information about properties
              available for rent or purchase.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Account Registration</h2>
          <p className="mb-4">
            To access certain features of the Platform, you may be required to
            register for an account. You agree to provide accurate, current, and
            complete information during the registration process and to update
            such information to keep it accurate, current, and complete.
          </p>
          <p className="mb-4">
            You are responsible for safeguarding your password and for all
            activities that occur under your account. You agree to notify us
            immediately of any unauthorized use of your account.
          </p>
          <p>
            We reserve the right to disable any user account at any time if, in
            our opinion, you have failed to comply with any provision of these
            Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">User Conduct</h2>
          <p className="mb-4">You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Use the Platform in any way that violates any applicable law or
              regulation.
            </li>
            <li>
              Impersonate any person or entity, or falsely state or otherwise
              misrepresent your affiliation with a person or entity.
            </li>
            <li>
              Interfere with or disrupt the Platform or servers or networks
              connected to the Platform.
            </li>
            <li>Post false, misleading, or fraudulent property listings.</li>
            <li>
              Collect or store personal data about other users without their
              consent.
            </li>
            <li>
              Use the Platform to send spam, chain letters, or other unsolicited
              communications.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Property Listings</h2>
          <p className="mb-4">
            All property listings on the Platform are provided by third parties.
            We do not guarantee the accuracy, completeness, or availability of
            any listing. We are not responsible for any decisions made based on
            the information provided in listings.
          </p>
          <p>
            Users who post property listings represent and warrant that they
            have the right to post such content and that the content is accurate
            and not misleading.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Intellectual Property</h2>
          <p className="mb-4">
            The Platform and its original content, features, and functionality
            are owned by VinaHome and are protected by international copyright,
            trademark, patent, trade secret, and other intellectual property or
            proprietary rights laws.
          </p>
          <p>
            You may not copy, modify, create derivative works of, publicly
            display, publicly perform, republish, or transmit any of the
            material on our Platform without prior written consent.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Limitation of Liability
          </h2>
          <p>
            In no event shall VinaHome, its directors, employees, partners,
            agents, suppliers, or affiliates be liable for any indirect,
            incidental, special, consequential, or punitive damages, including
            without limitation, loss of profits, data, use, goodwill, or other
            intangible losses, resulting from your access to or use of or
            inability to access or use the Platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Indemnification</h2>
          <p>
            You agree to defend, indemnify, and hold harmless VinaHome and its
            licensees and licensors, and their employees, contractors, agents,
            officers, and directors, from and against any and all claims,
            damages, obligations, losses, liabilities, costs or debt, and
            expenses, resulting from or arising out of your use and access of
            the Platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the
            laws of Vietnam, without regard to its conflict of law provisions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace
            these Terms at any time. If a revision is material, we will provide
            at least 30 days&apos; notice prior to any new terms taking effect.
            What constitutes a material change will be determined at our sole
            discretion.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at
            terms@vinahome.com.
          </p>
        </section>
      </div>
    </Container>
  );
}
