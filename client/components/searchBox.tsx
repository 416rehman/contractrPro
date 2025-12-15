import { Kbd } from "@heroui/kbd";
import { IconSearch, IconX, IconZoomQuestion } from "@tabler/icons-react";
import { Input } from "@heroui/input";
import { useEffect, useRef, useState } from "react";
import { Card, CardHeader } from "@heroui/card";
import { useUserStore } from "@/services/user";
import { search } from "@/services/search";
import SearchItem from "@/components/searchItem";
import { Button } from "@heroui/button";

/**
 * Search box component used to search for current organization's resources. It uses the search service to fetch results from the server.
 */
export default function SearchBox({ className }: { className?: string }) {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<any>({});
  const [count, setCount] = useState<number>(0);
  const currentOrganization = useUserStore(state => state.currentOrganization);
  useEffect(() => {
    //   fetch results from the server
    if (query && currentOrganization) {
      search(currentOrganization?.id, query).then((res) => {
        setResults(res);
        setIsCardOpen(true); // Open the card when results are fetched
      });
    }
  }, [query, currentOrganization]);

  useEffect(() => {
    if (query && results) {
      const count = Object.keys(results).reduce((acc, key) => acc + results[key].length, 0);
      setCount(count);
    }
  }, [query, results]);

  const [isCardOpen, setIsCardOpen] = useState<boolean>(false); // Track if the card is open
  const cardRef = useRef<HTMLDivElement | null>(null); // Ref for the card element
  useEffect(() => {
    // Close the card when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsCardOpen(false);
      }
    };

    if (isCardOpen) window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCardOpen]);

  return (
    <div className="md:relative">
      <Input aria-label="Search"
             className={"px-2"}
             classNames={{
               inputWrapper: "bg-default-100",
               input: "text-sm"
             }}
             endContent={
               <Kbd className="hidden lg:inline-block" keys={["command"]}>
                 K
               </Kbd>
             }
             labelPlacement="outside"
             placeholder={`Search ${currentOrganization?.name || "..."}`}
             onValueChange={setQuery}
             startContent={
               <IconSearch className="text-base text-default-400 pointer-events-none flex-shrink-0" />
             }
             type="search"
             value={query} />
      {isCardOpen && query && (
        <Card ref={cardRef}
              className={"absolute top-16 w-screen left-0 bg-content1 border-1 border-default-100 max-h-[80vh] overflow-y-auto md:w-full md:top-12 "}>
          <CardHeader className={"flex flex-row items-center justify-between"}>
            <div className={"text-sm font-medium text-default-500 truncate"}>{count} Results Found</div>
            <Button
              size={"sm"}
              variant={"flat"}
              color={"danger"}
              endContent={<IconX size={16} />}
              onClick={() => setIsCardOpen(false)} />
          </CardHeader>
          <div className={"flex flex-col gap-4 p-2"}>
            {count ? Object.keys(results).map((key) => {
              const result = results[key];
              if (!result?.length) {
                return null;
              }
              return (
                <div key={key} className={"flex flex-col gap-2"}>
                  <div className={"text-sm font-medium text-default-500 capitalize"}>{key}</div>
                  <div className={"flex flex-col gap-1"}>
                    {result.map((item: any) => (
                      <SearchItem item={item} type={key as any} key={item.id} query={query}
                                  onClick={() => setIsCardOpen(false)} />
                    ))}
                  </div>
                </div>
              );
            }) : (
              <div className={"flex flex-col items-center justify-center gap-2"}>
                <IconZoomQuestion className={"text-default-400"} size={48} />
                <p className={"text-default-500"}>No results found</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}