/**
 * Popout Window System
 * Allows logical frames to pop out into new windows for multi-monitor setups
 */

export interface PopoutOptions {
  width?: number;
  height?: number;
  title?: string;
  features?: string;
  onClose?: () => void;
}

export class PopoutManager {
  private popouts: Map<string, Window> = new Map();

  /**
   * Open a component in a popout window
   */
  openPopout(
    id: string,
    content: React.ReactNode | string,
    options: PopoutOptions = {}
  ): Window | null {
    // Close existing popout if open
    if (this.popouts.has(id)) {
      this.closePopout(id);
    }

    const {
      width = 800,
      height = 600,
      title = 'DLX Studios',
      features = 'width=800,height=600,resizable=yes,scrollbars=yes',
    } = options;

    const popout = window.open('', `popout-${id}`, features);

    if (!popout) {
      console.error('Failed to open popout window. Please allow popups.');
      return null;
    }

    // Set title
    popout.document.title = title;

    // Inject DLX theme styles
    const styles = `
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          background: #0a0a0f;
          color: #ffffff;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.875rem;
          overflow: auto;
        }
        #popout-content {
          padding: 1rem;
          height: 100vh;
          overflow: auto;
        }
      </style>
    `;

    // Write content
    if (typeof content === 'string') {
      popout.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            ${styles}
          </head>
          <body>
            <div id="popout-content">${content}</div>
          </body>
        </html>
      `);
    } else {
      // For React components, we'll need to render them
      popout.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            ${styles}
            <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
            <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
          </head>
          <body>
            <div id="popout-content"></div>
          </body>
        </html>
      `);
    }

    popout.document.close();

    // Handle close
    popout.addEventListener('beforeunload', () => {
      this.popouts.delete(id);
      options.onClose?.();
    });

    this.popouts.set(id, popout);
    return popout;
  }

  /**
   * Close a popout window
   */
  closePopout(id: string): void {
    const popout = this.popouts.get(id);
    if (popout && !popout.closed) {
      popout.close();
    }
    this.popouts.delete(id);
  }

  /**
   * Check if popout is open
   */
  isOpen(id: string): boolean {
    const popout = this.popouts.get(id);
    return popout !== undefined && !popout.closed;
  }

  /**
   * Close all popouts
   */
  closeAll(): void {
    this.popouts.forEach((popout, id) => {
      if (!popout.closed) {
        popout.close();
      }
    });
    this.popouts.clear();
  }
}

export const popoutManager = new PopoutManager();

// React hook for popout functionality
import { useState, useCallback } from 'react';

export function usePopout(id: string, options: PopoutOptions = {}) {
  const [isOpen, setIsOpen] = useState(false);

  const openPopout = useCallback(
    (content: React.ReactNode | string) => {
      const popout = popoutManager.openPopout(id, content, {
        ...options,
        onClose: () => {
          setIsOpen(false);
          options.onClose?.();
        },
      });
      setIsOpen(popout !== null);
    },
    [id, options]
  );

  const closePopout = useCallback(() => {
    popoutManager.closePopout(id);
    setIsOpen(false);
  }, [id]);

  return {
    isOpen,
    openPopout,
    closePopout,
  };
}

