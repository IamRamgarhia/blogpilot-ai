export default function AboutPage() {
  return (
    <article className="prose-invert max-w-none">
      <h1>BlogPilot AI — Built by Dice Codes</h1>
      <p className="lead text-slate-300">
        BlogPilot AI is free, open-source, and self-hostable. We built it because every blogger and
        agency deserves agency-grade SEO tooling without $89/month subscriptions.
      </p>

      <h2>Who is Dice Codes?</h2>
      <p className="text-slate-300">
        Dice Codes is a Punjab, India based digital studio that builds web apps, SaaS, mobile apps,
        e-commerce stores, and SEO-ready sites for startups and SMEs worldwide — at a fraction of US
        agency rates. We work with founders who want production-grade software without burning their
        seed round on engineering.
      </p>

      <h2>What we build</h2>
      <ul>
        <li>Custom SaaS products (like BlogPilot AI)</li>
        <li>Websites and e-commerce (WordPress, Shopify, custom)</li>
        <li>Mobile apps (Flutter — iOS + Android from one codebase)</li>
        <li>SEO services and digital marketing (PPC, Google Ads, social)</li>
        <li>UI/UX design and branding</li>
      </ul>

      <h2>Selected work</h2>
      <ul>
        <li>Oceglow US</li>
        <li>Marby</li>
        <li>Anahat Exclusive</li>
        <li>Bravo Pizza NYC</li>
      </ul>

      <h2>Want a custom SaaS like this for your industry?</h2>
      <p className="text-slate-300">
        Free 30-minute consultation. We will scope, estimate, and tell you honestly whether to
        build, buy, or skip.
      </p>
      <div className="not-prose flex flex-wrap gap-3 mt-4">
        <a
          href="https://wa.me/919888404991"
          target="_blank"
          rel="noreferrer noopener"
          className="px-4 py-2 inline-block rounded-lg bg-lime-500 text-slate-900 font-semibold"
        >
          WhatsApp 9888404991
        </a>
        <a
          href="mailto:Contact@dicecodes.com"
          className="px-4 py-2 inline-block rounded-lg bg-blue-500 text-white font-semibold"
        >
          Contact@dicecodes.com
        </a>
        <a
          href="https://dicecodes.com"
          target="_blank"
          rel="noreferrer noopener"
          className="px-4 py-2 inline-block rounded-lg border border-slate-700 text-slate-300 hover:text-white"
        >
          dicecodes.com →
        </a>
      </div>
    </article>
  );
}
