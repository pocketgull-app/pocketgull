import '@angular/compiler';
import { FineArtStorefrontComponent } from './fine-art-storefront.component';
import { AmazonListingGeneratorService } from '../services/amazon-listing-generator.service';
import { Injector, runInInjectionContext } from '@angular/core';

describe('FineArtStorefrontComponent', () => {
  let component: FineArtStorefrontComponent;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: AmazonListingGeneratorService, useClass: AmazonListingGeneratorService }
      ]
    });
    component = runInInjectionContext(injector, () => new FineArtStorefrontComponent());
  });

  it('should initialize with Eukaryotic Cell Macro active artwork and 3:4 aspect ratio', () => {
    expect(component.activeArt().title).toBe('Eukaryotic Cell Macro');
    expect(component.selectedSize()).toBe('18" × 24"');
    expect(component.selectedFrame()).toBe('walnut');
  });

  it('should update total price when changing size and frame finishes', () => {
    // 18" x 24" ($38) + walnut ($35) = $73
    expect(component.totalPrice()).toBe(73);

    // Switch to unframed
    component.selectFrame('unframed');
    expect(component.totalPrice()).toBe(38);

    // Switch to 30" x 40" ($78)
    component.selectSize('30" × 40"', 78);
    expect(component.totalPrice()).toBe(78);
  });

  it('should generate valid Amazon Affiliate URL with tag=pgdpo-20', () => {
    const url = component.amazonSearchUrl();
    expect(url).toContain('tag=pgdpo-20');
    expect(url).toContain('cell%20biology');
  });

  it('should switch active artwork to Synaptic Transmission', () => {
    const synapseArt = component.artworkCatalog[1];
    component.selectArtwork(synapseArt);

    expect(component.activeArt().title).toBe('Synaptic Transmission');
    expect(component.amazonSearchUrl()).toContain('neuroscience');
  });
});
