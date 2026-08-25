import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { FederatedLearningHudComponent } from './federated-learning-hud.component';
import { FederatedLearningService } from '../services/federated-learning.service';

describe('FederatedLearningHudComponent Unit Suite', () => {
  const createComponent = () => {
    const service = new FederatedLearningService();
    const injector = Injector.create({
      providers: [
        { provide: FederatedLearningService, useValue: service },
      ],
    });
    return runInInjectionContext(injector, () => new FederatedLearningHudComponent());
  };

  it('1. Initializes component with active service dependency', () => {
    const component = createComponent();
    expect(component).toBeTruthy();
    expect(component.flService).toBeTruthy();
    expect(component.flService.activeNodesCount()).toBe(5);
  });

  it('2. Triggers federated learning round successfully', async () => {
    const component = createComponent();
    const initialRound = component.flService.currentRound();
    await component.triggerRound();
    expect(component.flService.currentRound()).toBe(initialRound + 1);
    expect(component.errorMessage()).toBeNull();
  });
});
