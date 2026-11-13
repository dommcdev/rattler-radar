/**
 * The home page's event feed, as compound components that share state through
 * `EventFeed.Provider`. Place the pieces anywhere inside the provider:
 *
 *   <EventFeed.Provider events={events}>
 *     <EventFeed.Search />    search box
 *     <EventFeed.Filters />   filter pills
 *     <EventFeed.Count />     "14 events" / "3 of 14"
 *     <EventFeed.Grid />      the cards
 *     <EventFeed.Details />   side panel for the clicked event
 *   </EventFeed.Provider>
 */

import { EventFeedDetails } from "./event-details";
import { EventFeedProvider } from "./event-feed-context";
import { EventFeedCount, EventFeedFilters } from "./event-feed-filters";
import { EventFeedGrid } from "./event-feed-grid";
import { EventFeedSearch } from "./event-feed-search";

export const EventFeed = {
  Provider: EventFeedProvider,
  Search: EventFeedSearch,
  Filters: EventFeedFilters,
  Count: EventFeedCount,
  Grid: EventFeedGrid,
  Details: EventFeedDetails,
};
