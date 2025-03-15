"use client"

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Book, Country, Podcast } from '@/types';

interface GlobeMapProps {
  className?: string;
  books?: Book[];
  podcasts?: Podcast[];
  showUserItems?: boolean;
  onMarkerClick?: (type: 'book' | 'podcast', item: Book | Podcast) => void;
}

function GlobeMap({ 
  className, 
  books = [], 
  podcasts = [], 
  showUserItems = false,
  onMarkerClick 
}: GlobeMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // 清除所有标记
  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  };

  // 添加标记到地图
  const addMarkers = () => {
    if (!map.current || !mapLoaded) return;
    
    clearMarkers();

    // 处理书籍标记
    books.forEach(book => {
      book.countries.forEach(country => {
        // 这里需要根据国家代码获取经纬度坐标
        // 实际应用中应该有一个国家代码到经纬度的映射
        const coordinates = getCountryCoordinates(country.code);
        if (!coordinates || !map.current) return;

        const el = document.createElement('div');
        el.className = 'book-marker';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.backgroundImage = 'url(/icons/book-marker.svg)';
        el.style.backgroundSize = 'cover';
        el.style.cursor = 'pointer';

        const marker = new mapboxgl.Marker(el)
          .setLngLat(coordinates)
          .addTo(map.current);

        // 添加点击事件
        el.addEventListener('click', () => {
          onMarkerClick?.('book', book);
        });

        markersRef.current.push(marker);
      });
    });

    // 处理播客标记
    podcasts.forEach(podcast => {
      podcast.countries.forEach(country => {
        const coordinates = getCountryCoordinates(country.code);
        if (!coordinates || !map.current) return;

        const el = document.createElement('div');
        el.className = 'podcast-marker';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.backgroundImage = 'url(/icons/podcast-marker.svg)';
        el.style.backgroundSize = 'cover';
        el.style.cursor = 'pointer';

        const marker = new mapboxgl.Marker(el)
          .setLngLat(coordinates)
          .addTo(map.current);

        // 添加点击事件
        el.addEventListener('click', () => {
          onMarkerClick?.('podcast', podcast);
        });

        markersRef.current.push(marker);
      });
    });
  };

  // 高亮国家
  const highlightCountries = () => {
    if (!map.current || !mapLoaded) return;

    // 获取所有相关国家及其关联次数
    const countryCounts: Record<string, number> = {};
    
    books.forEach(book => {
      book.countries.forEach(country => {
        countryCounts[country.code] = (countryCounts[country.code] || 0) + 1;
      });
    });
    
    podcasts.forEach(podcast => {
      podcast.countries.forEach(country => {
        countryCounts[country.code] = (countryCounts[country.code] || 0) + 1;
      });
    });

    // 移除现有的高亮图层
    if (map.current.getLayer('countries-highlighted')) {
      map.current.removeLayer('countries-highlighted');
    }

    // 如果有相关国家，添加高亮图层
    if (Object.keys(countryCounts).length > 0) {
      const countryCodesList = Object.keys(countryCounts);
      
      // 添加高亮图层
      map.current.addLayer({
        id: 'countries-highlighted',
        type: 'fill',
        source: 'countries',
        'source-layer': 'country_boundaries',
        paint: {
          'fill-color': [
            'case',
            ['in', ['get', 'iso_3166_1'], ['literal', countryCodesList]],
            'rgba(65, 105, 225, 0.4)', // 高亮颜色
            'rgba(0, 0, 0, 0)' // 透明
          ],
          'fill-outline-color': 'rgba(65, 105, 225, 0.8)'
        },
        filter: ['in', ['get', 'iso_3166_1'], ['literal', countryCodesList]]
      });
    }
  };

  // 模拟国家代码到经纬度的映射
  // 实际应用中应该使用真实的地理数据
  const getCountryCoordinates = (countryCode: string): [number, number] | null => {
    const coordinates: Record<string, [number, number]> = {
      'US': [-95.7129, 37.0902],
      'CN': [104.1954, 35.8617],
      'JP': [138.2529, 36.2048],
      'GB': [-3.4359, 55.3781],
      'FR': [2.2137, 46.2276],
      'DE': [10.4515, 51.1657],
      'IT': [12.5674, 41.8719],
      'ES': [-3.7492, 40.4637],
      'AU': [133.7751, -25.2744],
      'BR': [-51.9253, -14.2350],
      'CA': [-106.3468, 56.1304],
      'IN': [78.9629, 20.5937],
      'RU': [105.3188, 61.5240],
      'ZA': [22.9375, -30.5595],
      'MX': [-102.5528, 23.6345],
      'AR': [-63.6167, -38.4161],
      'TH': [100.9925, 15.8700],
      'EG': [30.8025, 26.8206],
      'KR': [127.7669, 35.9078],
      'NZ': [174.8860, -40.9006],
    };
    
    return coordinates[countryCode] || null;
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // 这里需要设置 Mapbox 访问令牌，将在实际部署时从环境变量中获取
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

    if (mapboxgl.accessToken === '') {
      console.error('Mapbox 访问令牌未设置');
      return;
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11', // 使用浅色地图样式
      center: [0, 20], // 初始中心点
      zoom: 1.5, // 初始缩放级别
      projection: 'globe', // 使用球形投影
    });

    map.current.on('load', () => {
      if (!map.current) return;
      
      // 添加大气层效果
      map.current.setFog({
        color: 'rgb(220, 230, 240)', // 浅色大气层颜色
        'high-color': 'rgb(180, 200, 230)', // 高空大气层颜色
        'horizon-blend': 0.02, // 地平线混合
        'space-color': 'rgb(200, 220, 240)', // 太空颜色
        'star-intensity': 0.2, // 星星亮度
      });

      // 加载国家边界数据
      map.current.addSource('countries', {
        type: 'vector',
        url: 'mapbox://mapbox.country-boundaries-v1'
      });

      // 添加国家边界线图层
      map.current.addLayer({
        id: 'countries-boundaries',
        type: 'line',
        source: 'countries',
        'source-layer': 'country_boundaries',
        layout: {},
        paint: {
          'line-color': 'rgba(100, 120, 160, 0.5)',
          'line-width': 1
        }
      });

      setMapLoaded(true);
      addMarkers();
      highlightCountries();
    });

    // 清理函数
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // 当书籍或播客数据变化时，更新标记和高亮
  useEffect(() => {
    if (mapLoaded) {
      addMarkers();
      highlightCountries();
    }
  }, [books, podcasts, mapLoaded, showUserItems]);

  return (
    <div ref={mapContainer} className={className} />
  );
}

export default GlobeMap;
