import fs from 'fs-extra';
import { writeFile } from 'fs/promises';
import handlebars from 'handlebars';
import pathSettings from 'settings/paths';

import { Application } from 'blocks/application';

const { Logger } = Application;

const { websiteUrl, websiteDescription, websiteName } = Application.settings;
const outPath = `${pathSettings.publicPath}/feed.xml`;
const templatePath = 'src/templates/rssTemplate.hbs';

/**
 * Writes the feed.xml file.
 */
export class FeedWriter {
  /**
   * Generates the website's feed.xml from the JSON files of the pages.
   * @returns {Promise} A promise that will resolve when the feed has been
   * written to disk.
   */
  static write = async () => {
    const logger = new Logger('FeedWriter.write');
    const template = handlebars.compile(fs.readFileSync(templatePath, 'utf-8'));
    const pages = Application.dataset
      .getModel('Page')
      .records.feedEligible.slice(0, 50);
    logger.log(`Generating feed for top blog routes`);

    const feed = template({
      nodes: pages.flatMap(s => ({
        title: s.data.title,
        fullRoute: s.fullRoute,
        description: s.context.pageDescription,
        pubDate: new Date(s.data.firstSeen).toUTCString(),
      })),
      websiteName,
      websiteDescription,
      websiteUrl,
    });

    await writeFile(outPath, feed);

    logger.success('Generating feed complete');
  };
}
