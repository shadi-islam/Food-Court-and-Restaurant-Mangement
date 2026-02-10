import styles from "./PrivacyPolicy.module.css";

export default function PrivacyPolicy() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1>Privacy Policy</h1>
        <p className={styles.lastUpdated}>Last updated: February 2026</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            We are committed to protecting your privacy and ensuring you have a positive experience on our website. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <p>We may collect information about you in the following ways:</p>
          <ul>
            <li><strong>Personal Information:</strong> Name, email address, phone number, address (when booking tables or placing orders)</li>
            <li><strong>Payment Information:</strong> Payment method details (processed securely by payment processors)</li>
            <li><strong>Device Information:</strong> Browser type, IP address, device type, operating system</li>
            <li><strong>Usage Data:</strong> Pages visited, time spent, menu items viewed</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect for the following purposes:</p>
          <ul>
            <li>To process your orders and table reservations</li>
            <li>To send order confirmations and updates</li>
            <li>To respond to your inquiries and support requests</li>
            <li>To improve our website and services</li>
            <li>To comply with legal obligations</li>
            <li>To prevent fraudulent activities</li>
          </ul>
          <p><strong>Important:</strong> We do not sell your personal information to third parties.</p>
        </section>

        <section>
          <h2>4. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your personal information:
          </p>
          <ul>
            <li>HTTPS/SSL encryption for all data transmission</li>
            <li>Secure password storage using bcryptjs hashing</li>
            <li>Regular security updates and monitoring</li>
            <li>Restricted access to personal data</li>
          </ul>
          <p>
            However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2>5. Cookies and Tracking</h2>
          <p>
            We use cookies to enhance your experience. Cookies help us remember your preferences and login information. 
            You can disable cookies in your browser settings, but this may affect functionality.
          </p>
        </section>

        <section>
          <h2>6. Newsletter and Marketing</h2>
          <p>
            When you subscribe to our newsletter, you consent to receive promotional emails. 
            You can unsubscribe at any time by:
          </p>
          <ul>
            <li>Clicking the unsubscribe link in any email</li>
            <li>Contacting us at the email below</li>
          </ul>
        </section>

        <section>
          <h2>7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
            <li>Request a copy of your data</li>
          </ul>
        </section>

        <section>
          <h2>8. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <ul>
            <li>Email: privacy@yessbd.com</li>
            <li>Phone: +8801712345678</li>
            <li>Address: Pallabi, Mirpur 11</li>
          </ul>
        </section>

        <section>
          <h2>9. Policy Updates</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant changes 
            via email or by posting the updated policy on our website.
          </p>
        </section>
      </div>
    </div>
  );
}
