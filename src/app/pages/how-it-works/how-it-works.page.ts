import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InfoCardComponent } from '@components/info-card/info-card.component';
import { KNOWN_LIMITS, PIPELINE_STEPS, PROMPT_PREVIEW, SAFEGUARDS } from '@data/how-it-works-content';
import { SITE_LINKS } from '@data/site-links';
import { PipelineSimulatorComponent } from '@widgets/pipeline-simulator/pipeline-simulator.component';

@Component({
  selector: 'app-how-it-works-page',
  imports: [RouterLink, InfoCardComponent, PipelineSimulatorComponent],
  templateUrl: './how-it-works.page.html',
  styleUrl: './how-it-works.page.scss',
})
export class HowItWorksPage {
  protected readonly steps = PIPELINE_STEPS;
  protected readonly safeguards = SAFEGUARDS;
  protected readonly limits = KNOWN_LIMITS;
  protected readonly prompt = PROMPT_PREVIEW;
  protected readonly githubUrl = SITE_LINKS.github;
}