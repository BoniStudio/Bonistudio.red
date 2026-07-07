import type { SiteContent } from '../i18n/content';
import { PipelineGraph } from './PipelineGraph';
import { SectionTitle } from './SectionTitle';

type PipelineProps = {
  content: SiteContent['pipeline'];
};

export function Pipeline({ content }: PipelineProps) {
  return (
    <section className="section section--pipeline" id="pipeline">
      <SectionTitle
        eyebrow={content.eyebrow}
        title={content.title}
        copy={content.copy}
        align="center"
      />
      <PipelineGraph ariaLabel={content.ariaLabel} nodes={content.nodes} />
    </section>
  );
}
