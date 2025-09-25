import { useEffect, useState } from "react";
import { formatDate } from "../lib/utils";
import clsx from "clsx";

const BlogCat = ({categories, articles})=>{
const [selectedCategory, setSelectedCategory] = useState("all");
const [articless,setArticless] = useState([...articles]);

useEffect(()=>{
selectedCategory =="all" ? articles : setArticless([...articles].filter((article)=> article.data.category.toLowerCase() === selectedCategory.toLowerCase()));
},[selectedCategory])

useEffect(()=>{
    const params = new URLSearchParams(window.location.search);
    params.get("category") ? setSelectedCategory(params.get("category")): setSelectedCategory("all");
},[]);

   return <div className="p-4 sm:pt-8 sm:px-12 pb-20 min-h-dvh">
        <h1 className="text-white font-bold text-balance text-4xl md:text-6xl xl:text-8xl tracking-tight " >
             Blog 
        </h1>

        <ul className="mt-4 flex items-center gap-4">
            <li>
            <a href="/blog" className={clsx("w-fit px-4 py-1 text-sm bg-transparent rounded-full transition-all duration-300 ease-in-out",
                    selectedCategory === "all" ? "text-white bg-zinc-100/20 outline-2 outline-offset-2 outline-zinc-100/20" : "text-zinc-400 hover:text-zinc-300"
                )}>
                    All
                </a>
            </li>
                      {
                          categories.map((category) => (
                              <li key={category} >
                        <a
                            href={`/blog?category=${category.toLowerCase()}`}
                            className={clsx("w-fit px-4 py-1 text-sm bg-transparent rounded-full transition-all duration-300 ease-in-out",
                                selectedCategory === category.toLowerCase() ? "text-white bg-zinc-100/20 outline-2 outline-offset-2 outline-zinc-100/20" : "text-zinc-400 hover:text-zinc-200"
                            )}
                            >
                            {category}
                        </a>
                    </li>
                ))
            }
        </ul>
            
            <ul className="mt-4 space-y-6">
              {
                  articless.map((article) => (
                      <li key={article.data.title} >
                        <a
                            className="space-y-1 group"
                            href={`/blog/${article.data.slug}`}
                            >
                            <h2 className="text-xl xl:text-2xl text-zinc-300 group-hover:text-white text-balance font-medium underline group-hover:underline-offset-2 decoration-transparent group-hover:decoration-zinc-500">
                                {article.data.title}
                            </h2>
                            <p className="text-base text-zinc-400">
                                {article.data.snippet}
                            </p>
                            <p className="text-sm text-zinc-500">
                                {formatDate(article.data.pubDate)} &middot;{" "}
                                {article.data.author}
                            </p>
                        </a>
                    </li>
                ))
            }
        </ul>
    </div>
   }

export default BlogCat;