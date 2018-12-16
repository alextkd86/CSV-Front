import { ExportCSVFrontPage } from './app.po';

describe('export-csvfront App', () => {
  let page: ExportCSVFrontPage;

  beforeEach(() => {
    page = new ExportCSVFrontPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
