import { gql } from 'graphql-request';
import { requestGraphQL } from './api';

export async function getWPMLLanguages() {
  const query = gql`
    query GetWPMLLanguages {
      languages {
        code
        country_flag_url
        default_locale
        id
        language_code
        native_name
        translated_name
        url
      }
    }
  `;

  try {
    const data = await requestGraphQL(query, {}, { tags: ['wp:navigation'] });
    return data.languages || [];
  } catch (error) {
    console.error(`[languages] operation=list outcome=error name=${error?.name || 'Error'}`);
    return [];
  }
}

export async function getCurrentPageTranslations(slug) {
  const query = gql`
    query GetPageTranslations($slug: String!) {
      pageBy(uri: $slug) {
        translations {
          code
          name
          uri
          slug
        }
      }
    }
  `;

  try {
    const data = await requestGraphQL(query, { slug }, {
      tags: ['wp:page', `wp:page:${slug}`],
    });
    return data.pageBy?.translations || [];
  } catch (error) {
    console.error(`[languages] operation=translations outcome=error name=${error?.name || 'Error'}`);
    return [];
  }
}
