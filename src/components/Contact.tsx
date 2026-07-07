import { Github, Mail, Radio } from 'lucide-react';

export function Contact() {
  return (
    <footer className="contact-panel" id="contact">
      <div>
        <p>Contact</p>
        <h2>Open channel for products, games, and AI-built worlds.</h2>
      </div>
      <div className="contact-panel__links">
        <a href="mailto:bonistudio.core@gmail.com">
          <Mail size={18} aria-hidden="true" />
          bonistudio.core@gmail.com
        </a>
        <a href="https://github.com/" target="_blank" rel="noreferrer">
          <Github size={18} aria-hidden="true" />
          GitHub
        </a>
        <a href="#contact" aria-label="Social links placeholder">
          <Radio size={18} aria-hidden="true" />
          Social links placeholder
        </a>
      </div>
    </footer>
  );
}
