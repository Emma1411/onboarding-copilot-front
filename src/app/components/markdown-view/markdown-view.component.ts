import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { parseMarkdown } from '@utils/parse-markdown';

@Component({
  selector: 'app-markdown-view',
  imports: [NgTemplateOutlet],
  templateUrl: './markdown-view.component.html',
  styleUrl: './markdown-view.component.scss',
})
export class MarkdownViewComponent {
  readonly markdown = input.required<string>();
  protected readonly blocks = computed(() => parseMarkdown(this.markdown()));
}