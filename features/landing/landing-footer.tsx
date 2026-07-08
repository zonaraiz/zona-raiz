"use client"

import { useTranslation } from "react-i18next"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useRoutes } from "@/i18n/client-router"
import { IconBrandTwitter, IconBrandInstagram, IconBrandLinkedin, IconBrandFacebook } from "@tabler/icons-react"
import { Lang } from "@/i18n/settings"
import Logo from "@/assets/svg/logo"

const socialLinks = [
  { icon: IconBrandTwitter, href: "https://twitter.com" },
  { icon: IconBrandInstagram, href: "https://instagram.com" },
  { icon: IconBrandLinkedin, href: "https://linkedin.com" },
  { icon: IconBrandFacebook, href: "https://facebook.com" },
]

export function LandingFooter() {
  const { t } = useTranslation("landing")
  const { lang } = useParams<{ lang: Lang }>()
  const routes = useRoutes()

  const footerLinks = [
    { key: "footer.about", href: `/${lang}/about` },
    { key: "footer.terms", href: `/${lang}/terms` },
    { key: "footer.privacy", href: `/${lang}/privacy` },
    { key: "footer.contact", href: `/${lang}/contact` },
  ]

  return (
    <footer className="bg-[#040a18] text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div className="md:col-span-2">
            <Link href={routes.home()} className="flex items-center gap-2.5 mb-4">
              <Logo className="size-8" />
              <span className="font-semibold text-white text-[15px] tracking-tight">
                {t("footer.brand")}
              </span>
            </Link>
            <p className="text-[13px] text-white/60 max-w-xs leading-relaxed">
              {t("footer.tagline")}
            </p>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold text-white/60 uppercase tracking-widest mb-4">
              Links
            </h4>
            <ul className="space-y-2">
              {footerLinks.map(({ key, href }) => (
                <li key={key}>
                  <Link
                    href={href}
                    className="text-[13px] text-white/70 hover:text-[#00d6be] transition-colors"
                  >
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold text-white/60 uppercase tracking-widest mb-4">
              {t("footer.follow_us")}
            </h4>
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#10203a] hover:bg-[#16304f] flex items-center justify-center transition-colors"
                >
                  <Icon className="size-4 text-white/70" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-white/50">
            {t("footer.copyright")}
          </p>
          <div className="flex items-center gap-6">
            <Link href={routes.home()} className="text-[12px] text-white/50 hover:text-white transition-colors">
              {t("nav.home")}
            </Link>
            <Link href={routes.search()} className="text-[12px] text-white/50 hover:text-white transition-colors">
              {t("nav.listing")}
            </Link>
            <Link href={`/${lang}/agents`} className="text-[12px] text-white/50 hover:text-white transition-colors">
              {t("agents.title")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
