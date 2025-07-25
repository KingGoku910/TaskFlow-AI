// @/components/landing/sections/FooterSection.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { LdgDiv } from '../elements/LdgDiv';
import { LdgParagraph } from '../elements/LdgParagraph';
import { LdgSpan } from '../elements/LdgSpan';
import { LdgHeading4 } from '../elements/LdgHeading4';
import { LdgUnorderedList } from '../elements/LdgUnorderedList';
import { LdgListItem } from '../elements/LdgListItem';
import { LdgAnchor } from '../elements/LdgAnchor';
import { AppLogoSvg } from '@/components/common/AppLogoSvg'; // Import the new logo


interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
}

const FooterLink: React.FC<FooterLinkProps> = ({ href, children }) => (
  <Link href={href} className="hover:text-primary hover:underline dark:text-foreground/80 dark:hover:text-primary" prefetch={false}>
    {children}
  </Link>
);

const SocialIconLink: React.FC<{href: string, label: string, children: React.ReactNode}> = ({href, label, children}) => (
   <LdgAnchor href={href} className="text-muted-foreground hover:text-primary dark:text-foreground/70 dark:hover:text-primary" aria-label={label}>
      {children}
   </LdgAnchor>
);

export function FooterSection() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Product",
      links: [
        { href: "#features", text: "Features" },
        { href: "#feature-details", text: "Details" },
        { href: "#pricing", text: "Pricing" },
        { href: "/dashboard", text: "Dashboard" },
        { href: "#", text: "Updates" },
      ],
    },
    {
      title: "Company",
      links: [
        { href: "#", text: "About Us" },
        { href: "#", text: "Careers" },
        { href: "#", text: "Contact" },
        { href: "#", text: "Blog" },
      ],
    },
    {
      title: "Legal",
      links: [
        { href: "#", text: "Terms of Service" },
        { href: "#", text: "Privacy Policy" },
        { href: "#", text: "Cookie Policy" },
      ],
    },
  ];

  const socialLinks = [
      { href: "#", label: "Twitter", icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63.961-.689 1.8-1.56 2.46-2.548l-.047-.02z"></path></svg> },
      { href: "#", label: "LinkedIn", icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"></path></svg> },
      { href: "#", label: "GitHub", icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path></svg> },
  ];


  return (
    <footer className="bg-muted dark:bg-black text-muted-foreground border-t">
      <LdgDiv className="container mx-auto px-4 md:px-6 py-12">
        <LdgDiv className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <LdgDiv>
            <Link href="/" className="flex items-center justify-center" prefetch={false}>
              <img
                src="https://imgur.com/F8fyOmc.png"
                alt="TaskFlow AI"
                className="h-24 w-56 max-w-[340px] object-contain"
              />
              <span className="sr-only">TaskFlow AI</span>
            </Link>
            <LdgParagraph className="text-sm dark:text-foreground/80">Transforming ideas into actionable tasks with the power of AI.</LdgParagraph>
          </LdgDiv>
          {footerSections.map((section) => (
            <LdgDiv key={section.title}>
              <LdgHeading4 className="font-semibold text-foreground mb-3">{section.title}</LdgHeading4>
              <LdgUnorderedList className="space-y-2 text-sm">
                {section.links.map((link) => (
                  <LdgListItem key={link.text}>
                    <FooterLink href={link.href}>{link.text}</FooterLink>
                  </LdgListItem>
                ))}
              </LdgUnorderedList>
            </LdgDiv>
          ))}
        </LdgDiv>
        <LdgDiv className="mt-8 pt-8 border-t border-gray-200/50 dark:border-[var(--sidebar-accent)] dark:hover:border-[var(--sidebar-accent-hov)] flex flex-col sm:flex-row justify-between items-center">
          <LdgParagraph className="text-xs dark:text-foreground/70">&copy; {currentYear} TaskFlow AI. All rights reserved.</LdgParagraph>
          <LdgDiv className="flex space-x-4 mt-4 sm:mt-0">
            {socialLinks.map(social => (
               <SocialIconLink key={social.label} href={social.href} label={social.label}>
                  {social.icon}
               </SocialIconLink>
            ))}
          </LdgDiv>
        </LdgDiv>
      </LdgDiv>
    </footer>
  );
}
