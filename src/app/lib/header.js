import { gql } from 'graphql-request';
import { requestGraphQL } from './api';

// Server-side function to fetch all header data in one query (CACHED).
// If the underlying fetch throws, unstable_cache does NOT cache the rejection,
// so the next request retries the endpoint instead of serving a poisoned
// (empty) header. The caller (SiteHeader / Suspense) is responsible for a
// graceful fallback when this rejects.
export async function getHeaderData(language = 'en', options = {}) {
    return fetchHeaderDataFromGraphQL(language, options);
}

// Internal function to actually fetch from GraphQL
async function fetchHeaderDataFromGraphQL(language = 'en', options = {}) {
    const primaryMenuId = language === 'th' ? 12 : 3;
    const topMenuId = language === 'th' ? 13 : 4;
    const mobileMenuId = language === 'th' ? 16 : 15;

    const query = gql`
        query GetHeaderData($primaryMenuId: ID!, $topMenuId: ID!, $mobileMenuId: ID!) {
            # Primary Menu
            primaryMenu: menu(id: $primaryMenuId, idType: DATABASE_ID) {
                id
                name
                menuItems(first: 100) {
                    nodes {
                        id
                        label
                        url
                        path
                        parentId
                        menuItemIcon {
                            menuIcon
                        }
                        cssClasses
                    }
                }
            }
            # Top Menu
            topMenu: menu(id: $topMenuId, idType: DATABASE_ID) {
                name
                menuItems(first: 100) {
                    nodes {
                        id
                        label
                        url
                        path
                        menuItemIcon {
                            menuIcon
                        }
                    }
                }
            }
            # Mobile Menu
            mobileMenu: menu(id: $mobileMenuId, idType: DATABASE_ID) {
                id
                name
                menuItems(first: 100) {
                    nodes {
                        id
                        label
                        url
                        path
                        parentId
                        menuItemIcon {
                            menuIcon
                        }
                        cssClasses
                    }
                }
            }
            # CTA Data
            themeGeneralSettings {
              callToActionButtons {
                requestAProposal {
                  target
                  title
                  url
                }
                getInTouchLabel
                getInTouch {
                  ctaLink {
                    target
                    title
                    url
                  }
                  ctaIcon
                }
                fieldGroupName
                getInTouchLabelThai
                getInTouchThai {
                  ctaLink {
                    target
                    title
                    url
                  }
                  ctaIcon
                }
                requestAProposalThai {
                  target
                  title
                  url
                }
              }
            }
        }
    `;

    const variables = { 
        primaryMenuId, 
        topMenuId, 
        mobileMenuId 
    };

    const data = await requestGraphQL(query, variables, {
        signal: options.signal,
        tags: ['wp:navigation', `wp:navigation:${language}`],
        validate: (result) => (result?.primaryMenu?.menuItems?.nodes || []).length > 0,
    });

    // Treat a response with no primary menu items as a failure too — a "success"
    // with empty menus would otherwise get cached and hide the nav. Throw so the
    // cache stays unpoisoned and the next request retries.
    const primaryItems = data.primaryMenu?.menuItems?.nodes || [];
    if (primaryItems.length === 0) {
        throw new Error('Header GraphQL returned no primary menu items');
    }

    return {
        primaryMenu: {
            menuItems: primaryItems
        },
        topMenu: {
            menuTopItems: data.topMenu?.menuItems?.nodes || []
        },
        mobileMenu: {
            menuMobileItems: data.mobileMenu?.menuItems?.nodes || []
        },
        cta: data.themeGeneralSettings
    };
}

export async function getPrimaryMenu(language = 'en') {
    // Use menu ID based on language
    const menuId = language === 'th' ? 12 : 3;
    
    const query = gql`query GetPrimaryMenu($menuId: ID!) {
        menu(id: $menuId, idType: DATABASE_ID) {
          id
          name
          menuItems(first: 100) {
            nodes {
                id
                label
                url
                path
                parentId
            }
          }
        }
      }
    `;

    const variables = { menuId: menuId };
    const data = await requestGraphQL(query, variables, { tags: ['wp:navigation'] });
    const menuItems = data.menu?.menuItems?.nodes || [];
    return {
      menuItems: menuItems
    };
}

export async function getMobileMenu(language = 'en') {
  const menuId = language === 'th' ? 16 : 15;
  const query = gql`query GetMobileMenu($menuId: ID!) {
      menu(id: $menuId, idType: DATABASE_ID) {
        id
        name
        menuItems(first: 100) {
          nodes {
              id
              label
              url
              path
              parentId
              menuItemIcon {
                menuIcon
              }
              cssClasses
          }
        }
      }
    }
  `;

  const variables = { menuId: menuId };
  const data = await requestGraphQL(query, variables, { tags: ['wp:navigation'] });
  const menuMobileItems = data.menu?.menuItems?.nodes || [];
  return {
    menuMobileItems: menuMobileItems
  };
}

export async function getTopMenu(language = 'en') {
    // Use menu ID based on language
    const menuId = language === 'th' ? 13 : 4;
    const query = gql`
      query GetTopMenu($menuId: ID!) {
        menu(id: $menuId, idType: DATABASE_ID) {
          name
          menuItems(first: 100) {
            nodes {
              id
              label
              url
              path
            }
          }
        }
      }
    `;

    const variables = { menuId: menuId };
    const data = await requestGraphQL(query, variables, { tags: ['wp:navigation'] });
    const menuTopItems = data.menu?.menuItems?.nodes || [];
    return {
      menuTopItems: menuTopItems
    };
}

export async function getCTA() {
    const query = gql`
      query GetCTA {
        themeGeneralSettings {
          callToActionButtons {
            requestAProposal {
              target
              title
              url
            }
            getInTouch {
              target
              title
              url
            }
            fieldGroupName
            getInTouchThai {
              target
              title
              url
            }
            requestAProposalThai {
              target
              title
              url
            }
          }
        }
      }
    `;

    const data = await requestGraphQL(query, {}, { tags: ['wp:navigation'] });
    return data.themeGeneralSettings || {};
}
