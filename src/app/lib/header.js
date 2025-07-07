import { GraphQLClient, gql } from 'graphql-request';

const endpoint = process.env.API_DOMAIN || 'http://bitec.local/graphql';
export const client = new GraphQLClient(endpoint);

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
    const data = await client.request(query, variables);
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
  const data = await client.request(query, variables);
  const menuMobileItems = data.menu?.menuItems?.nodes || [];
  console.log('mobile Menu:', menuMobileItems);
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
            }
          }
        }
      }
    `;

    const variables = { menuId: menuId };
    const data = await client.request(query, variables);
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

    const data = await client.request(query);
    return data.themeGeneralSettings || {};
}

