import {
  AutocompleteOptions,
  AutocompleteState,
  createAutocomplete,
} from "@algolia/autocomplete-core";
import { getAlgoliaResults } from "@algolia/autocomplete-preset-algolia";
import type { Hit } from "@algolia/client-search";
import { ChevronRightIcon, SearchIcon, XIcon } from "@heroicons/react/outline";
import algoliasearch from "algoliasearch/lite";
import * as React from "react";

import { classNames } from "../utils";

const searchClient = algoliasearch(
  "latency",
  "6be0576ff61c053d5f9a3225e2a90f76"
);

type AutocompleteItem = Hit<{
  brand: string;
  categories: string[];
  image: string;
  name: string;
  objectID: string;
  url: string;
}>;

export function Autocomplete(
  props: Partial<AutocompleteOptions<AutocompleteItem>>
): JSX.Element {
  const [autocompleteState, setAutocompleteState] = React.useState<
    AutocompleteState<AutocompleteItem>
  >({
    collections: [],
    completion: null,
    context: {},
    isOpen: false,
    query: "",
    activeItemId: null,
    status: "idle",
  });

  // React.useEffect(() => {
  //   const handleEscape = (e: KeyboardEvent) => {
  //     if (e.key !== "Escape") {
  //       return;
  //     }
  //     setAutocompleteState((prevState) => ({ ...prevState, isOpen: false }));
  //   };
  //   addEventListener("keydown", handleEscape);
  //   return () => removeEventListener("keydown", handleEscape);
  // }, []);

  const autocomplete = React.useMemo(
    () =>
      createAutocomplete<
        AutocompleteItem,
        React.BaseSyntheticEvent,
        React.MouseEvent,
        React.KeyboardEvent
      >({
        onStateChange({ state }) {
          setAutocompleteState(state);
        },
        getSources() {
          return [
            {
              sourceId: "products",
              getItems({ query }) {
                return getAlgoliaResults({
                  searchClient,
                  queries: [
                    {
                      indexName: "instant_search",
                      query,
                      params: {
                        hitsPerPage: 5,
                        highlightPreTag: "<mark>",
                        highlightPostTag: "</mark>",
                      },
                    },
                  ],
                });
              },
              getItemUrl({ item }) {
                return item.url;
              },
            },
          ];
        },
        ...props,
      }),
    [props]
  );
  const inputRef = React.useRef<HTMLInputElement>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const { getEnvironmentProps } = autocomplete;

  React.useEffect(() => {
    if (!formRef.current || !panelRef.current || !inputRef.current) {
      return undefined;
    }

    const { onTouchStart, onTouchMove } = getEnvironmentProps({
      formElement: formRef.current,
      inputElement: inputRef.current,
      panelElement: panelRef.current,
    });

    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchmove", onTouchMove);

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [getEnvironmentProps, formRef, inputRef, panelRef]);

  return (
    <div className="relative" {...autocomplete.getRootProps({})}>
      <form
        ref={formRef}
        {...autocomplete.getFormProps({ inputElement: inputRef.current })}
      >
        <label className="sr-only" {...autocomplete.getLabelProps({})}>
          Search
        </label>
        <div className="relative text-gray-400 focus-within:text-gray-600">
          <div className="pointer-events-none absolute inset-y-0 left-0 px-3 flex items-center">
            <button
              type="submit"
              title="Submit"
              className={classNames(
                "rounded-md pointer-events-auto p-1 -ml-1",
                "focus:outline-none focus:ring-2 focus:ring-teal-600"
              )}
            >
              <SearchIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <input
            className="block w-full bg-white py-2 pl-11 pr-3 border border-transparent rounded-md leading-5 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-teal-600 focus:ring-white focus:border-white sm:text-sm"
            ref={inputRef}
            {...autocomplete.getInputProps({
              inputElement: inputRef.current,
            })}
          />
        </div>
      </form>

      {autocompleteState.isOpen ? (
        <div
          ref={panelRef}
          className={[
            "aa-Panel",
            "aa-Panel--desktop",
            autocompleteState.status === "stalled" && "aa-Panel--stalled",
          ]
            .filter(Boolean)
            .join(" ")}
          {...autocomplete.getPanelProps({})}
        >
          <div
            className={classNames(
              "absolute inset-x-0 mt-4 overflow-hidden bg-white shadow",
              "sm:mt-6 sm:w-96 sm:rounded-md",
              // Full bleed form up until `sm`
              "w-screen ml-[calc(50%-0.25rem)] transform -translate-x-1/2",
              // Reset full bleed for `sm` and above
              "sm:w-[calc(100%+8rem)] sm:-ml-16 sm:translate-x-0"
            )}
          >
            {autocompleteState.collections.map((collection, index) => {
              const { source, items } = collection;
              return (
                <section key={`source-${index}`}>
                  {items.length > 0 && (
                    <ul
                      className="divide-y divide-gray-200"
                      {...autocomplete.getListProps()}
                    >
                      {items.map((item, index) => {
                        return (
                          <li
                            key={item.objectID}
                            {...autocomplete.getItemProps({ item, source })}
                          >
                            <a
                              href={item.url}
                              className={classNames(
                                index === 0 && "rounded-t-md",
                                index === items.length - 1 && "rounded-b-md",
                                "block border-2 border-transparent",
                                "hover:bg-gray-50",
                                "focus:outline-none focus:ring-inset focus:ring-2 focus:ring-offset-2 focus:ring-offset-teal-600 focus:ring-white focus:border-white"
                              )}
                            >
                              <div className="flex items-center px-4 py-4 sm:px-6">
                                <div className="flex items-center flex-1 min-w-0">
                                  <div className="flex-shrink-0 border p-1 rounded">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      className="w-12 h-12 object-contain"
                                      src={item.image}
                                      alt={item.name}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0 px-4">
                                    <div>
                                      <p className="text-sm font-medium text-teal-700 truncate">
                                        {item.name}
                                      </p>
                                      <div className="flex items-center mt-2 text-sm text-gray-500">
                                        <p className="truncate">
                                          By <strong>{item.brand}</strong> in{" "}
                                          <strong>{item.categories[0]}</strong>
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <ChevronRightIcon
                                    className="w-5 h-5 text-gray-400"
                                    aria-hidden="true"
                                  />
                                </div>
                              </div>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
