import { CollectionConfig } from '.';
import { ArgsError } from 'blocks/utilities/error';
import { rawCollections } from 'fixtures/blocks/collectionConfigs';
import { Env } from 'blocks/utilities/env';

describe('ColectionConfig', () => {
  beforeAll(() => {
    Env.setup();
  });

  describe('constructor', () => {
    it('throws an error if called without all required keys', () => {
      expect(() => new CollectionConfig({})).toThrow(ArgsError);
    });
  });

  describe('constructed with valid data', () => {
    let collectionConfigs = {};
    beforeAll(() => {
      collectionConfigs.collection = new CollectionConfig(
        rawCollections.collection
      );
    });

    it('should contain all passed data', () => {
      expect(collectionConfigs.collection.name).toBe(
        rawCollections.collection.name
      );
      expect(collectionConfigs.collection.description).toBe(
        rawCollections.collection.description
      );
      expect(collectionConfigs.collection.slug).toBe(
        rawCollections.collection.slug
      );
      expect(collectionConfigs.collection.featured).toBe(
        rawCollections.collection.featured
      );
      expect(collectionConfigs.collection.snippetIds).toEqual(
        rawCollections.collection.snippetIds
      );
      expect(collectionConfigs.collection.theme).toEqual(
        rawCollections.collection.theme
      );
    });

    it('should produce the correct id', () => {
      expect(collectionConfigs.collection.id).toBe(
        rawCollections.collection.slug
      );
    });

    it('should produce the correct icon', () => {
      expect(collectionConfigs.collection.icon).toBe(
        rawCollections.collection.theme.iconName
      );
    });

    it('should return the correct asset path', () => {
      expect(
        collectionConfigs.collection.assetPath.endsWith(
          global.settings.paths.staticAssetPath
        )
      ).toBe(true);
    });

    it('should return the correct output path', () => {
      expect(
        collectionConfigs.collection.outPath.endsWith(
          global.settings.paths.contentPath
        )
      ).toBe(true);
    });
  });
});
