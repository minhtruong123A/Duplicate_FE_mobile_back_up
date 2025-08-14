// src/screens/HelpScreen.tsx

import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';

const HelpScreen = () => {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Terms of Service */}
            <Text style={styles.heading}>Terms Of Service</Text>
            <Text style={styles.lastUpdated}>Last Updated: 30th July, 2025</Text>
            <Text style={styles.paragraph}>
                Welcome to Manga Mystery Box (MMB). By accessing or using our platform, you agree to comply with these Terms of Use ("Terms"). Please read them carefully.
            </Text>

            <Text style={styles.subHeading}>1. Acceptance of Terms</Text>
            <Text style={styles.paragraph}>
                By registering for, accessing, or using the MMB platform (including web and mobile applications), you:
            </Text>
            <Text style={styles.listItem}>• Confirm that you are at least 16 years of age (or the legal age in your jurisdiction).</Text>
            <Text style={styles.listItem}>• Acknowledge that these Terms form a legally binding agreement between you and MMB.</Text>
            <Text style={styles.listItem}>• Agree that if you do not accept these Terms, you must immediately cease using the platform.</Text>

            <Text style={styles.subHeading}>2. Eligibility Requirements</Text>
            <Text style={styles.paragraph}>
                To use MMB, you must:
            </Text>
            <Text style={styles.listItem}>✅ Be 16 years or older.</Text>
            <Text style={styles.listItem}>✅ Provide accurate registration information (e.g., email, username).</Text>
            <Text style={styles.listItem}>✅ Not be barred from receiving digital services under applicable laws.</Text>
            <Text style={styles.paragraph}>
                Note: Accounts found to violate eligibility criteria will be terminated without refund.
            </Text>

            <Text style={styles.subHeading}>3. Account Security & Responsibilities</Text>
            <Text style={styles.paragraph}>
                As a user, you agree to:
            </Text>
            <Text style={styles.listItem}>🔒 Maintain confidentiality of your login credentials.</Text>
            <Text style={styles.listItem}>⚠️ Notify MMB immediately of unauthorized account access.</Text>
            <Text style={styles.listItem}>🚫 Never share, sell, or transfer your account to another party.</Text>
            <Text style={styles.paragraph}>
                MMB is not liable for losses resulting from breached accounts due to user negligence.
            </Text>

            <Text style={styles.subHeading}>4. Permitted & Prohibited Uses</Text>
            <Text style={styles.paragraph}>✅ Allowed Activities</Text>
            <Text style={styles.listItem}>Collecting, trading, buying, or auctioning virtual manga characters cards.</Text>
            <Text style={styles.listItem}>Participating in community events and rewards programs.</Text>
            <Text style={styles.paragraph}>🚫 Prohibited Conduct</Text>
            <Text style={styles.listItem}>Fraudulent transactions (e.g., chargebacks, fake listings).</Text>
            <Text style={styles.listItem}>Harassment, hate speech, or spamming other users.</Text>
            <Text style={styles.listItem}>Exploiting bugs or using third-party tools to manipulate the platform.</Text>
            <Text style={styles.listItem}>Commercial use (e.g., reselling MMB assets outside the platform).</Text>
            <Text style={styles.paragraph}>Violations may result in account suspension or legal action.</Text>

            <Text style={styles.subHeading}>5. Intellectual Property Rights</Text>
            <Text style={styles.paragraph}><Text style={{ fontWeight: 'bold' }}>Ownership:</Text> All artwork, characters, logos, and software are owned by MMB or its licensors. Users receive a limited, non-exclusive license to use purchased items within the MMB platform only.</Text>
            <Text style={styles.paragraph}><Text style={{ fontWeight: 'bold' }}>Restrictions:</Text></Text>
            <Text style={styles.listItem}>📌 Copy, modify, or redistribute MMB content without written permission.</Text>
            <Text style={styles.listItem}>📌 Use MMB assets in external projects (e.g., games, merchandise).</Text>
            <Text style={styles.listItem}>📌 Reverse-engineer or decompile the platform’s code.</Text>
            <Text style={styles.paragraph}>Exception: Fan art or non-commercial tributes may be allowed with attribution.</Text>

            <Text style={styles.subHeading}>6. Trading & Auction Policies</Text>
            <Text style={styles.paragraph}><Text style={{ fontWeight: 'bold' }}>Fair Trading Rules:</Text> All trades are final unless proven fraudulent. Sellers must accurately describe listed items (e.g., rarity, condition).</Text>
            <Text style={styles.paragraph}><Text style={{ fontWeight: 'bold' }}>Auction Guidelines:</Text> ⏰ Bids are binding; failure to pay may result in penalties. 🛡️ MMB moderators review high-value auctions for fairness.</Text>
            <Text style={styles.paragraph}>Note: MMB charges a 5% transaction fee on successful auctions.</Text>

            <Text style={styles.subHeading}>7. Termination & Suspension</Text>
            <Text style={styles.paragraph}>
                MMB reserves the right to:
            </Text>
            <Text style={styles.listItem}>Suspend or terminate accounts violating these Terms.</Text>
            <Text style={styles.listItem}>Confiscate fraudulent assets without refund.</Text>
            <Text style={styles.listItem}>Ban users engaging in severe misconduct (e.g., scams, hate speech).</Text>
            <Text style={styles.paragraph}>Appeals: Users may contact support@mmb.com to dispute actions.</Text>

            <Text style={styles.subHeading}>8. Modifications to Terms</Text>
            <Text style={styles.paragraph}>
                MMB will notify users of material changes via email or in-app alerts.
                Continued use 30 days after updates constitutes acceptance.
                Historic versions of these Terms are archived here.
            </Text>

            <Text style={styles.subHeading}>9. Limitation of Liability</Text>
            <Text style={styles.paragraph}>
                MMB is not responsible for:
            </Text>
            <Text style={styles.listItem}>Lost profits due to service interruptions.</Text>
            <Text style={styles.listItem}>User disputes over trades or auctions.</Text>
            <Text style={styles.listItem}>Third-party actions (e.g., payment processor errors).</Text>
            <Text style={styles.paragraph}>
                Maximum liability is limited to the amount spent by the user in the last 6 months.
            </Text>

            <Text style={styles.subHeading}>10. Governing Law</Text>
            <Text style={styles.paragraph}>
                These Terms are governed by the laws of Vietnam. Any disputes arising out of or in connection with these Terms shall be resolved exclusively by The competent Courts of Ho Chi Minh City.
            </Text>

            <Text style={styles.subHeading}>11. Contact Information</Text>
            <Text style={styles.paragraph}>
                For questions or disputes:
            </Text>
            <Text style={styles.listItem}>📧 Email: MMB@gmail.com</Text>
            <Text style={styles.listItem}>📌 Address: 7 D. D1, Long Thanh My, Thu Duc, Ho Chi Minh</Text>
            <Text style={styles.paragraph}>
                Response time: Within 7 business days.
            </Text>

            <Text style={styles.paragraph}>
                <Text style={{ fontWeight: 'bold' }}>Acknowledgment:</Text> By using MMB, you confirm that you have read, understood, and agreed to these Terms.
            </Text>

            {/* Copyright Policy */}
            <Text style={[styles.heading, { marginTop: 32 }]}>Copyright Policy</Text>
            <Text style={styles.lastUpdated}>Last Updated: 30th July, 2025</Text>

            <Text style={styles.paragraph}>
                Manga Mystery Box ("MMB") respects intellectual property rights and expects all users to do the same. This Copyright Policy outlines the ownership, permitted uses, and infringement procedures for content on our platform.
            </Text>

            <Text style={styles.subHeading}>1. Ownership of Content</Text>
            <Text style={styles.paragraph}>Protected Materials</Text>
            <Text style={styles.listItem}>🎴 Digital Assets: Manga/anime-themed boxes and cards, character designs, and artwork</Text>
            <Text style={styles.listItem}>💻 Software & Code: Platform infrastructure, algorithms, and UI/UX elements</Text>
            <Text style={styles.listItem}>📝 Text Content: Descriptions, lore, and instructional materials</Text>

            <Text style={styles.paragraph}>Restrictions</Text>
            <Text style={styles.listItem}>🚫 Reproduce, modify, or create derivative works</Text>
            <Text style={styles.listItem}>🚫 Distribute content outside the MMB ecosystem</Text>
            <Text style={styles.listItem}>🚫 Use assets for commercial purposes (e.g., merchandise, third-party apps)</Text>
            <Text style={styles.paragraph}>Exception: Brief excerpts for reviews/news may qualify as fair use.</Text>

            <Text style={styles.subHeading}>2. User-Generated Content (UGC)</Text>
            <Text style={styles.paragraph}>
                License Grant
            </Text>
            <Text style={styles.listItem}>✅ Confirm ownership or legal right to share the material</Text>
            <Text style={styles.listItem}>📜 Grant MMB a non-exclusive, transferable, sub-licensable license to:</Text>
            <Text style={styles.listItem}>• Display UGC within the platform</Text>
            <Text style={styles.listItem}>• Use for promotional materials</Text>
            <Text style={styles.listItem}>• Adapt for technical requirements (e.g., formatting)</Text>

            <Text style={styles.paragraph}>Prohibited UGC</Text>
            <Text style={styles.listItem}>⚠️ Third-party copyrighted material without permission</Text>
            <Text style={styles.listItem}>⚠️ Trademarked logos/branding</Text>
            <Text style={styles.listItem}>⚠️ AI-generated art violating source artist rights</Text>

            <Text style={styles.subHeading}>3. Copyright Infringement Reports</Text>
            <Text style={styles.paragraph}>DMCA Compliance</Text>
            <Text style={styles.paragraph}>
                To report infringement, send a notice to MMB@gmail.com with:
            </Text>
            <Text style={styles.listItem}>1-Identification</Text>
            <Text style={styles.listItem}>Description of copyrighted work</Text>
            <Text style={styles.listItem}>URL(s) of infringing material</Text>
            <Text style={styles.listItem}>2-Contact Information</Text>
            <Text style={styles.listItem}>Full legal name</Text>
            <Text style={styles.listItem}>Address, phone, email</Text>
            <Text style={styles.listItem}>3-Legal Declarations</Text>
            <Text style={styles.listItem}>Statement of good faith belief</Text>
            <Text style={styles.listItem}>Verification under penalty of perjury</Text>

            <Text style={styles.subHeading}>4. Enforcement Actions</Text>
            <Text style={styles.paragraph}>
                MMB reserves the right to:
            </Text>
            <Text style={styles.listItem}>🔨 Immediate Removal of infringing content</Text>
            <Text style={styles.listItem}>📛 Account Suspension for repeat offenders</Text>
            <Text style={styles.listItem}>⚖️ Legal Referral for severe violations</Text>
            <Text style={styles.paragraph}>Appeals: Submit within 30 days to MMB@gmail.com.</Text>

            <Text style={styles.subHeading}>5. Platform-Specific Rules</Text>
            <Text style={styles.paragraph}>
                Digital Collectibles
            </Text>
            <Text style={styles.listItem}>Cards purchased grant limited in-platform usage rights only</Text>
            <Text style={styles.listItem}>Resale must occur through MMB-approved markets</Text>
            <Text style={styles.paragraph}>Fan Art must be original creations (no traced/copied artwork) and tag original creators when possible.</Text>

            <Text style={styles.subHeading}>6. Global Compliance</Text>
            <Text style={styles.paragraph}>
                MMB adheres to:
            </Text>
            <Text style={styles.listItem}>🌐 DMCA (US)</Text>
            <Text style={styles.listItem}>📜 EU Copyright Directive</Text>
            <Text style={styles.listItem}>🎴 Japan's Copyright Act for manga-derived content</Text>
            <Text style={styles.paragraph}>International takedown requests will be processed within 10 business days.</Text>

            <Text style={styles.subHeading}>7. Policy Updates</Text>
            <Text style={styles.paragraph}>
                We will:
            </Text>
            <Text style={styles.listItem}>📢 Notify users of changes via email/platform alerts</Text>
            <Text style={styles.listItem}>🗂 Maintain version history here</Text>
            <Text style={styles.paragraph}>Continued use constitutes acceptance.</Text>

            <Text style={styles.subHeading}>Contact</Text>
            <Text style={styles.paragraph}>
                For copyright matters:
            </Text>
            <Text style={styles.listItem}>📧 Email: MMB@gmail.com</Text>
            <Text style={styles.listItem}>📌 Address: 7 D. D1, Long Thanh My, Thu Duc, Ho Chi Minh</Text>
            <Text style={styles.paragraph}>Response time: 5-7 business days</Text>

            <Text style={styles.paragraph}>
                <Text style={{ fontWeight: 'bold' }}>Acknowledgment:</Text> By using MMB, you confirm understanding of this policy and agree to comply with all applicable copyright laws.
            </Text>

            {/* Privacy Policy */}
            <Text style={[styles.heading, { marginTop: 32 }]}>Privacy Policy</Text>
            <Text style={styles.lastUpdated}>Last Updated: 30th July, 2025</Text>

            <Text style={styles.paragraph}>
                At Manga Mystery Box (MMB), we are committed to protecting your personal data. This Privacy Policy explains how we collect, use, share, and safeguard your information when you use our platform. By accessing MMB, you consent to the practices described below.
            </Text>

            <Text style={styles.subHeading}>1. Data We Collect</Text>
            <Text style={styles.paragraph}>Personal Information</Text>
            <Text style={styles.listItem}>📌 Identity Data: Name, email address, phone number (optional).</Text>
            <Text style={styles.listItem}>📌 Transaction Data: Purchase history, payment methods.</Text>
            <Text style={styles.listItem}>📌 Behavioral Data: Cards collected, trades completed, auction activity.</Text>
            <Text style={styles.paragraph}>Note: We do not knowingly collect data from users under 16s.</Text>

            <Text style={styles.subHeading}>2. How We Use Your Data</Text>
            <Text style={styles.paragraph}>
                Your information helps us:
            </Text>
            <Text style={styles.listItem}>🔹 Deliver Services: Process trades/auctions. Authenticate logins.</Text>
            <Text style={styles.listItem}>🔹 Improve MMB: Analyze trends (e.g., popular card series). Test new features.</Text>
            <Text style={styles.listItem}>🔹 Ensure Security: Detect fraud (e.g., fake auctions). Prevent unauthorized access.</Text>

            <Text style={styles.subHeading}>3. Data Sharing & Third Parties</Text>
            <Text style={styles.paragraph}>
                We do not sell your data. Limited sharing occurs only with:
            </Text>
            <Text style={styles.listItem}>🤝 Essential Service Providers: Payment processors (PayOS). Cloud hosting (Cloud).</Text>
            <Text style={styles.listItem}>⚖️ Legal Compliance: If required by law (e.g., court orders). Contracts: Partners must adhere to GDPR/CCPA standards.</Text>

            <Text style={styles.subHeading}>4. Your Rights</Text>
            <Text style={styles.paragraph}>
                You may:
            </Text>
            <Text style={styles.listItem}>✅ Access – Request a copy of your data.</Text>
            <Text style={styles.listItem}>✏️ Correct – Update inaccurate details.</Text>
            <Text style={styles.listItem}>🗑️ Delete – Erase your account/data (exclusions apply).</Text>
            <Text style={styles.listItem}>🚫 Opt-Out – Unsubscribe from marketing.</Text>
            <Text style={styles.paragraph}>
                To exercise rights, contact: MMB@gmail.com. Response time: 15 business days.
            </Text>

            <Text style={styles.subHeading}>5. Authentication & Session Management</Text>
            <Text style={styles.paragraph}>Token-Based System (No Cookies)</Text>
            <Text style={styles.listItem}>🔐 JWT Tokens stored in your browser's memory, containing encrypted user ID and expiration timestamp.</Text>
            <Text style={styles.listItem}>Token auto-refreshes periodically; logout immediately invalidates token.</Text>
            <Text style={styles.listItem}>No local storage, no tracking, and tokens are domain-locked.</Text>

            <Text style={styles.subHeading}>6. Data Retention</Text>
            <Text style={styles.paragraph}>
                We retain your data:
            </Text>
            <Text style={styles.listItem}>Active Accounts: Until deletion request.</Text>
            <Text style={styles.listItem}>Inactive Accounts: 3 years post-last login.</Text>
            <Text style={styles.listItem}>Transaction Records: 7 years (for legal compliance).</Text>
            <Text style={styles.paragraph}>Anonymized data may be kept for analytics.</Text>

            <Text style={styles.subHeading}>7. Policy Updates</Text>
            <Text style={styles.paragraph}>
                We will notify users of material changes via email/platform alerts. Continued use constitutes acceptance.
            </Text>

            <Text style={styles.subHeading}>8. Contact & Complaints</Text>
            <Text style={styles.paragraph}>
                Questions? Contact our Data Protection Officer:
            </Text>
            <Text style={styles.listItem}>📧 Email: MMB@gmail.com</Text>
            <Text style={styles.listItem}>📌 Address: 7 D. D1, Long Thanh My, Thu Duc, Ho Chi Minh</Text>
            <Text style={styles.paragraph}>For EU/UK users: Lodge complaints with your local supervisory authority.</Text>

            <Text style={styles.paragraph}>
                <Text style={{ fontWeight: 'bold' }}>Acknowledgement:</Text> By using MMB, you confirm you have read and understood this policy.
            </Text>

            <Text style={styles.footer}>“Collect with confidence.”</Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    heading: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    lastUpdated: {
        fontSize: 12,
        color: '#666',
        marginBottom: 12,
    },
    subHeading: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 6,
    },
    paragraph: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
        color: '#333',
    },
    listItem: {
        fontSize: 14,
        lineHeight: 20,
        marginLeft: 12,
        marginBottom: 6,
        color: '#444',
    },
    footer: {
        fontStyle: 'italic',
        fontSize: 14,
        marginTop: 32,
        textAlign: 'center',
        color: '#666',
    },
});

export default HelpScreen;
