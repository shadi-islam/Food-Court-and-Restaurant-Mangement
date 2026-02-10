import styles from "./TermsOfService.module.css";

export default function TermsOfService() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1>Terms of Service</h1>
        <p className={styles.lastUpdated}>Last updated: February 2026</p>

        <section>
          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
          </p>
        </section>

        <section>
          <h2>2. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials (information or software) on our website 
            for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, 
            and under this license you may not:
          </p>
          <ul>
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or for any public display</li>
            <li>Attempt to decompile or reverse engineer any software contained on the website</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
            <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
          </ul>
        </section>

        <section>
          <h2>3. Disclaimer</h2>
          <p>
            The materials on our website are provided on an 'as is' basis. We make no warranties, expressed or implied, 
            and hereby disclaim and negate all other warranties including, without limitation, implied warranties or 
            conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property 
            or other violation of rights.
          </p>
        </section>

        <section>
          <h2>4. Limitations</h2>
          <p>
            In no event shall our company or its suppliers be liable for any damages (including, without limitation, damages 
            for loss of data or profit, or due to business interruption) arising out of the use or inability to use the 
            materials on our website.
          </p>
        </section>

        <section>
          <h2>5. Accuracy of Materials</h2>
          <p>
            The materials appearing on our website could include technical, typographical, or photographic errors. 
            We do not warrant that any of the materials on our website are accurate, complete, or current. 
            We may make changes to the materials contained on our website at any time without notice.
          </p>
        </section>

        <section>
          <h2>6. Links</h2>
          <p>
            We have not reviewed all of the sites linked to our website and are not responsible for the contents of any 
            such linked site. The inclusion of any link does not imply endorsement by us of the site. Use of any such linked 
            website is at the user's own risk.
          </p>
        </section>

        <section>
          <h2>7. Modifications</h2>
          <p>
            We may revise these terms of service for our website at any time without notice. By using this website, 
            you are agreeing to be bound by the then current version of these terms of service.
          </p>
        </section>

        <section>
          <h2>8. Ordering and Payment</h2>
          <p>
            When you place an order on our website, you are offering to purchase the selected items. 
            All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order.
          </p>
          <ul>
            <li>Prices are subject to change without notice</li>
            <li>Payment must be received before order fulfillment (unless otherwise noted)</li>
            <li>We accept major credit cards and digital payment methods</li>
            <li>Refund policies are displayed at checkout</li>
          </ul>
        </section>

        <section>
          <h2>9. User Content</h2>
          <p>
            In these website standard terms and conditions, "User Content" shall mean any audio, video, text, images, 
            or other material you choose to display on this website. By displaying User Content, you grant us a 
            worldwide, irrevocable, license to use your User Content in any media now known or hereafter developed.
          </p>
        </section>

        <section>
          <h2>10. Prohibited Conduct</h2>
          <p>You may not:</p>
          <ul>
            <li>Harass or cause distress or inconvenience to any person</li>
            <li>Transmit obscene or offensive content</li>
            <li>Disrupt the normal flow of dialogue within our website</li>
            <li>Attempt unauthorized access to our systems</li>
            <li>Engage in any form of phishing or data collection</li>
          </ul>
        </section>

        <section>
          <h2>11. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of [Your Country/State], 
            and you irrevocably submit to the exclusive jurisdiction of the courts located in that location.
          </p>
        </section>

        <section>
          <h2>12. Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <ul>
            <li>Email: support@restaurant.com</li>
            <li>Phone: +1-800-RESTAURANT</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
