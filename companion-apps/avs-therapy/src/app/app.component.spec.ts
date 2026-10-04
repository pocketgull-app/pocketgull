import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('should create the app', () => {
    const app = new AppComponent();
    expect(app).toBeTruthy();
  });

  it(`should have the 'avs-therapy' title`, () => {
    const app = new AppComponent();
    expect(app.title).toEqual('avs-therapy');
  });
});
