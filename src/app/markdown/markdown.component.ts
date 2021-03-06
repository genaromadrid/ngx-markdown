import { AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MarkdownService } from './markdown.service';

// workaround to fix rollup namespace import
// https://github.com/rollup/rollup/issues/670#issuecomment-284621537
import * as _marked from 'marked';
const marked = _marked;

import * as Prism from 'prismjs';

import 'prismjs/prism';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-diff';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-perl';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-sass';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-typescript';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'markdown, [markdown]',
  template: '<ng-content></ng-content>',
  styleUrls: ['./markdown.component.scss'],
})
export class MarkdownComponent implements AfterViewInit, OnChanges {
  @Input() data: string;
  @Input() src: string;

  constructor(
    public element: ElementRef,
    public markdownService: MarkdownService,
  ) { }

  ngAfterViewInit() {
    if (this.data) {
      this.handleData();
      return;
    }
    if (this.src) {
      this.handleSrc();
      return;
    }
    this.handleRaw(this.element.nativeElement.innerHTML);
  }

  // SimpleChanges parameter is required for AoT compilation (do not remove)
  ngOnChanges(changes: SimpleChanges) {
    if ('data' in changes) {
      this.handleData();
      return;
    }
    if ('src' in changes) {
      this.handleSrc();
      return;
    }
  }

  handleData() {
    this.handleRaw(this.data);
  }

  handleSrc() {
    const extension = this.src
      ? this.src.split('.').splice(-1).join()
      : null;
    this.markdownService.getSource(this.src)
      .subscribe(data => {
        const raw = extension !== 'md'
          ? '```' + extension + '\n' + data + '\n```'
          : data;
        this.handleRaw(raw);
      });
  }

  handleRaw(raw: string) {
    const markdown = this.prepare(raw);
    this.element.nativeElement.innerHTML = marked(markdown);
    Prism.highlightAll(false);
  }

  prepare(raw: string) {
    if (!raw) {
      return '';
    }
    let indentStart: number;
    return raw
      .replace(/\&gt;/g, '>')
      .split('\n')
      .map((line: string) => {
        // find position of 1st non-whitespace character
        // to determine the markdown indentation start
        if (line.length > 0 && isNaN(indentStart)) {
          indentStart = line.search(/\S|$/);
        }
        // remove whitespaces before indentation start
        return indentStart
          ? line.substring(indentStart)
          : line;
      }).join('\n');
  }
}
