'use client';

import * as React from "react";
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export function HeroClient({ slides }: { slides: any[] }) {
    return (
        <Carousel
            opts={{
                align: "start",
                loop: true,
            }}
            plugins={[
                Autoplay({
                    delay: 8000,
                }),
            ]}
            className="w-full h-full absolute inset-0"
        >
            <CarouselContent className="h-full ml-0">
                {slides.map((slide, index) => (
                    <CarouselItem key={slide.id} className="relative h-full pl-0 min-h-[85vh]">
                        {/* 1. Background Layer */}
                        <div className="absolute inset-0 z-0">
                            {slide.background_url?.endsWith('.mp4') ? (
                                <video
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover opacity-40 grayscale-[20%]"
                                >
                                    <source src={slide.background_url} type="video/mp4" />
                                </video>
                            ) : (
                                <div className="absolute inset-0">
                                    <img
                                        src={slide.background_url || '/placeholder.jpg'}
                                        alt="Hero Background"
                                        className="w-full h-full object-cover opacity-30 grayscale-[20%]"
                                    />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/30" />
                        </div>

                        {/* 2. Content Layer */}
                        <div className="relative z-10 h-full flex items-center justify-center">
                            <div className="container px-4 md:px-6">
                                <div className="max-w-3xl space-y-6">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: false }} // Re-animate on slide change if possible, but embla renders side-by-side so this might fire only once. Key change helps.
                                        key={`text-${slide.id}`}
                                        transition={{ duration: 0.5 }}
                                    >
                                        {slide.badge_text && (
                                            <span className="inline-block px-3 py-1 rounded-full bg-orange-600/90 text-white text-sm font-medium mb-4">
                                                {slide.badge_text}
                                            </span>
                                        )}
                                        <h1
                                            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight"
                                            dangerouslySetInnerHTML={{ __html: slide.title }}
                                        />
                                    </motion.div>

                                    <motion.p
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        key={`sub-${slide.id}`}
                                        viewport={{ once: false }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                        className="text-lg md:text-xl text-slate-200 max-w-2xl leading-relaxed"
                                    >
                                        {slide.subtitle}
                                    </motion.p>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        key={`cta-${slide.id}`}
                                        viewport={{ once: false }}
                                        transition={{ duration: 0.5, delay: 0.4 }}
                                        className="flex flex-col sm:flex-row gap-4 pt-4"
                                    >
                                        {slide.cta_primary_text && (
                                            <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-8 h-14" asChild>
                                                <Link href={slide.cta_primary_link || '#'}>{slide.cta_primary_text}</Link>
                                            </Button>
                                        )}
                                        {slide.cta_secondary_text && (
                                            <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-lg px-8 h-14 backdrop-blur-sm" asChild>
                                                <Link href={slide.cta_secondary_link || '#'}>{slide.cta_secondary_text}</Link>
                                            </Button>
                                        )}
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>

            {/* Optional: Navigation Arrows (hidden on mobile maybe, or styled nicely) */}
            {slides.length > 1 && (
                <>
                    <CarouselPrevious className="left-4 bg-white/10 hover:bg-white/20 text-white border-none hidden md:flex" />
                    <CarouselNext className="right-4 bg-white/10 hover:bg-white/20 text-white border-none hidden md:flex" />
                </>
            )}
        </Carousel>
    );
}
