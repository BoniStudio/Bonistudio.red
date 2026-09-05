import { useEffect, type RefObject } from 'react';
import { animate, createAnimatable, createScope, onScroll, stagger } from 'animejs';

const revealSectionSelector = '[data-reveal-section]';
const revealItemSelector = '[data-reveal-item]';

function getRevealItems(section: HTMLElement) {
  return Array.from(section.querySelectorAll<HTMLElement>(revealItemSelector)).filter(
    (item) => item.closest(revealSectionSelector) === section,
  );
}

export function useSignalMotion(
  rootRef: RefObject<HTMLElement | null>,
  dependencyKey: unknown,
) {
  useEffect(() => {
    const root = rootRef.current;

    if (!root) return;

    const motionScope = createScope({
      root,
      mediaQueries: {
        reducedMotion: '(prefers-reduced-motion: reduce)',
        finePointer: '(hover: hover) and (pointer: fine)',
        verticalPipeline: '(max-width: 820px)',
      },
    });

    motionScope.add(() => {
      const reducedMotion = motionScope.matches.reducedMotion;
      const finePointer = motionScope.matches.finePointer;
      const verticalPipeline = motionScope.matches.verticalPipeline;
      const sections = Array.from(
        root.querySelectorAll<HTMLElement>(revealSectionSelector),
      );
      const revealItems = sections.flatMap(getRevealItems);
      const pipelineBeams = Array.from(
        root.querySelectorAll<HTMLElement>('.pipeline-track__beam'),
      );
      const timelineProgress = Array.from(
        root.querySelectorAll<HTMLElement>('.timeline-rail__progress'),
      );
      const cursor = root.querySelector<HTMLElement>('.signal-cursor');

      if (reducedMotion) {
        if (revealItems.length) {
          animate(revealItems, {
            opacity: 1,
            y: 0,
            duration: 0,
          });
        }

        if (pipelineBeams.length) {
          animate(pipelineBeams, {
            [verticalPipeline ? 'scaleY' : 'scaleX']: 1,
            duration: 0,
          });
        }

        if (timelineProgress.length) {
          animate(timelineProgress, {
            scaleY: 1,
            duration: 0,
          });
        }

        if (cursor) {
          animate(cursor, {
            opacity: 0,
            duration: 0,
          });
        }

        return;
      }

      sections.forEach((section) => {
        const items = getRevealItems(section);

        if (!items.length) return;

        animate(items, {
          opacity: { from: 0, to: 1 },
          y: { from: 44, to: 0 },
          duration: 900,
          delay: stagger(72, { start: 40 }),
          ease: 'out(4)',
          autoplay: onScroll({
            target: section,
            enter: '86% top',
            repeat: false,
            sync: 'play',
          }),
        });
      });

      pipelineBeams.forEach((beam) => {
        const target =
          beam.closest<HTMLElement>(revealSectionSelector) ?? beam.parentElement ?? beam;

        animate(beam, {
          [verticalPipeline ? 'scaleY' : 'scaleX']: { from: 0, to: 1 },
          duration: 1000,
          ease: 'linear',
          autoplay: onScroll({
            target,
            enter: '88% top',
            leave: '12% bottom',
            sync: 0.2,
          }),
        });
      });

      timelineProgress.forEach((progress) => {
        const target =
          progress.closest<HTMLElement>(revealSectionSelector) ??
          progress.parentElement ??
          progress;

        animate(progress, {
          scaleY: { from: 0, to: 1 },
          duration: 1000,
          ease: 'linear',
          autoplay: onScroll({
            target,
            enter: '88% top',
            leave: '12% bottom',
            sync: 0.2,
          }),
        });
      });

      if (!cursor || !finePointer) {
        if (cursor) {
          animate(cursor, {
            opacity: 0,
            duration: 0,
          });
        }
        return;
      }

      animate(cursor, {
        opacity: 0,
        duration: 0,
      });

      const cursorMotion = createAnimatable(cursor, {
        x: { unit: 'px', duration: 240, ease: 'out(4)' },
        y: { unit: 'px', duration: 240, ease: 'out(4)' },
        opacity: { duration: 160, ease: 'linear' },
        scale: { duration: 180, ease: 'out(3)' },
      });

      const showCursor = (event: PointerEvent) => {
        cursorMotion.x(event.clientX);
        cursorMotion.y(event.clientY);
        cursorMotion.opacity(1);
      };
      const hideCursor = () => cursorMotion.opacity(0);
      const compressCursor = () => cursorMotion.scale(0.72);
      const releaseCursor = () => cursorMotion.scale(1);

      window.addEventListener('pointermove', showCursor, { passive: true });
      window.addEventListener('pointerdown', compressCursor, { passive: true });
      window.addEventListener('pointerup', releaseCursor, { passive: true });
      window.addEventListener('blur', hideCursor);
      document.documentElement.addEventListener('mouseleave', hideCursor);

      return () => {
        window.removeEventListener('pointermove', showCursor);
        window.removeEventListener('pointerdown', compressCursor);
        window.removeEventListener('pointerup', releaseCursor);
        window.removeEventListener('blur', hideCursor);
        document.documentElement.removeEventListener('mouseleave', hideCursor);
      };
    });

    return () => motionScope.revert();
  }, [dependencyKey, rootRef]);
}
