"use client"

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Book, City, Country, Podcast } from '@/types';

interface GlobeMapProps {
  className?: string;
  books?: Book[];
  podcasts?: Podcast[];
  showUserItems?: boolean;
  onMarkerClick?: (type: 'book' | 'podcast', item: Book | Podcast) => void;
  countryCodes?: string[];
  onCountryClick?: (countryCode: string) => void;
  onCountryHover?: (countryCode: string) => void;
}

// 用于缓存已获取的城市坐标
const cityCoordinatesCache: Record<string, [number, number]> = {};

function GlobeMap({ 
  className, 
  books = [], 
  podcasts = [], 
  showUserItems = false,
  onMarkerClick,
  countryCodes = [],
  onCountryClick,
  onCountryHover
}: GlobeMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapStyleLoaded, setMapStyleLoaded] = useState(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const hoveredCountryIdRef = useRef<string | null>(null);
  const [pendingGeocodeRequests, setPendingGeocodeRequests] = useState(0);
  const [geocodeComplete, setGeocodeComplete] = useState(false);

  // 清除所有标记
  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  };

  // 使用 Mapbox Geocoding API 获取城市坐标
  const geocodeCity = async (cityName: string, countryCode: string): Promise<[number, number] | null> => {
    // 创建缓存键
    const cacheKey = `${cityName}-${countryCode}`;
    
    // 如果已经在缓存中，直接返回
    if (cityCoordinatesCache[cacheKey]) {
      return cityCoordinatesCache[cacheKey];
    }
    
    try {
      // 构建 Geocoding API 请求 URL
      // 限制搜索结果为指定国家代码，提高准确性
      const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cityName)}.json?country=${countryCode.toLowerCase()}&types=place&access_token=${accessToken}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        // Mapbox 返回的坐标是 [经度, 纬度] 格式
        const coordinates: [number, number] = [
          data.features[0].center[0],
          data.features[0].center[1]
        ];
        
        // 保存到缓存
        cityCoordinatesCache[cacheKey] = coordinates;
        return coordinates;
      }
      
      console.warn(`未找到城市坐标: ${cityName}, ${countryCode}`);
      return null;
    } catch (error) {
      console.error(`获取城市坐标失败: ${cityName}, ${countryCode}`, error);
      return null;
    }
  };

  // 添加标记到地图
  const addMarkers = async () => {
    if (!map.current || !mapLoaded) return;
    
    clearMarkers();
    
    // 重置地理编码状态
    setPendingGeocodeRequests(0);
    setGeocodeComplete(false);
    
    let pendingRequests = 0;

    // 处理书籍标记
    for (const book of books) {
      for (const city of book.cities) {
        pendingRequests++;
        setPendingGeocodeRequests(prev => prev + 1);
        
        // 使用城市名称和国家代码获取坐标
        const coordinates = await geocodeCity(city.name, city.country_code);
        
        if (coordinates && map.current) {
          const el = document.createElement('div');
          el.className = 'book-marker';
          el.style.width = '24px';
          el.style.height = '24px';
          el.style.backgroundImage = 'url(/icons/book-marker.svg)';
          el.style.backgroundSize = 'cover';
          el.style.cursor = 'pointer';

          const marker = new mapboxgl.Marker(el)
            .setLngLat(coordinates)
            .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(`${city.name} - ${book.title}`))
            .addTo(map.current);

          el.addEventListener('click', () => {
            onMarkerClick?.('book', book);
          });

          markersRef.current.push(marker);
        }
        
        setPendingGeocodeRequests(prev => prev - 1);
      }
    }

    // 处理播客标记
    for (const podcast of podcasts) {
      for (const city of podcast.cities) {
        pendingRequests++;
        setPendingGeocodeRequests(prev => prev + 1);
        
        // 使用城市名称和国家代码获取坐标
        const coordinates = await geocodeCity(city.name, city.country_code);
        
        if (coordinates && map.current) {
          const el = document.createElement('div');
          el.className = 'podcast-marker';
          el.style.width = '24px';
          el.style.height = '24px';
          el.style.backgroundImage = 'url(/icons/podcast-marker.svg)';
          el.style.backgroundSize = 'cover';
          el.style.cursor = 'pointer';

          const marker = new mapboxgl.Marker(el)
            .setLngLat(coordinates)
            .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(`${city.name} - ${podcast.title}`))
            .addTo(map.current);

          el.addEventListener('click', () => {
            onMarkerClick?.('podcast', podcast);
          });

          markersRef.current.push(marker);
        }
        
        setPendingGeocodeRequests(prev => prev - 1);
      }
    }
    
    // 如果没有请求，直接设置为完成
    if (pendingRequests === 0) {
      setGeocodeComplete(true);
    }
  };

  // 高亮国家
  const highlightCountries = () => {
    if (!map.current || !mapLoaded) return;

    // 获取所有相关国家代码
    const countryCodesList = countryCodes.length > 0 
      ? countryCodes 
      : [...new Set([
          ...books.flatMap(book => book.cities.map(city => city.country_code)),
          ...podcasts.flatMap(podcast => podcast.cities.map(city => city.country_code))
        ])];
    
    // 移除现有的高亮图层
    if (map.current.getLayer('countries-highlighted')) {
      map.current.removeLayer('countries-highlighted');
    }

    // 如果有相关国家，添加高亮图层
    if (countryCodesList.length > 0) {
      map.current.addLayer({
        id: 'countries-highlighted',
        type: 'fill',
        source: 'countries',
        'source-layer': 'country_boundaries',
        paint: {
          'fill-color': [
            'case',
            ['in', ['get', 'iso_3166_1'], ['literal', countryCodesList]],
            'rgba(65, 105, 225, 0.4)', 
            'rgba(0, 0, 0, 0)' 
          ],
          'fill-outline-color': 'rgba(65, 105, 225, 0.8)'
        },
        filter: ['in', ['get', 'iso_3166_1'], ['literal', countryCodesList]]
      });
    }
  };

  // 设置国家交互事件
  const setupCountryInteractions = () => {
    if (!map.current || !mapLoaded) return;

    map.current.on('click', 'countries-highlighted', (e) => {
      if (!e.features || e.features.length === 0) return;
      
      const countryCode = e.features[0].properties?.iso_3166_1;
      if (countryCode && onCountryClick) {
        onCountryClick(countryCode);
      }
    });

    map.current.on('mousemove', 'countries-highlighted', (e) => {
      if (!e.features || e.features.length === 0) return;
      
      if (e.features.length > 0) {
        if (hoveredCountryIdRef.current) {
          map.current?.setFeatureState(
            { source: 'countries', sourceLayer: 'country_boundaries', id: hoveredCountryIdRef.current },
            { hover: false }
          );
        }
        
        const countryCode = e.features[0].properties?.iso_3166_1;
        const id = e.features[0].id;
        
        if (id) {
          hoveredCountryIdRef.current = id as string;
          map.current?.setFeatureState(
            { source: 'countries', sourceLayer: 'country_boundaries', id },
            { hover: true }
          );
        }
        
        if (countryCode && onCountryHover) {
          onCountryHover(countryCode);
        }
      }
    });

    map.current.on('mouseleave', 'countries-highlighted', () => {
      if (hoveredCountryIdRef.current) {
        map.current?.setFeatureState(
          { source: 'countries', sourceLayer: 'country_boundaries', id: hoveredCountryIdRef.current },
          { hover: false }
        );
      }
      hoveredCountryIdRef.current = null;
    });
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // 添加预加载样式，防止黑色闪现
    const preloadStyle = document.createElement('style');
    preloadStyle.innerHTML = `
      .mapboxgl-canvas-container,
      .mapboxgl-canvas,
      .mapboxgl-map {
        background-color: rgb(220, 245, 255) !important;
      }
    `;
    document.head.appendChild(preloadStyle);

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

    if (mapboxgl.accessToken === '') {
      console.error('Mapbox 访问令牌未设置');
      return;
    }

    // 预加载地图样式
    const preloadMapStyle = async () => {
      try {
        // 预先获取地图样式，减少加载时间
        await fetch('https://api.mapbox.com/styles/v1/mapbox/outdoors-v12?access_token=' + mapboxgl.accessToken);
      } catch (e) {
        console.error('预加载地图样式失败', e);
      }
    };
    
    preloadMapStyle();

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12', 
      center: [0, 20], 
      zoom: 1.5, 
      projection: 'globe',
      attributionControl: false, // 禁用属性控件
      logoPosition: 'bottom-right', // 设置logo位置
      localIdeographFontFamily: "'Noto Sans', 'Noto Sans CJK SC', sans-serif", // 支持中文字体
      fadeDuration: 0, // 消除样式切换时的渐变效果
      renderWorldCopies: true, // 渲染多个世界副本
      preserveDrawingBuffer: true, // 保留绘图缓冲区
      transformRequest: (url, resourceType) => {
        // 为样式请求添加缓存控制
        if (resourceType === 'Style' && !url.includes('?')) {
          return { url: url + '?optimize=true' };
        }
        return { url };
      }
    });

    // 地图初始化完成
    map.current.on('styledata', () => {
      setMapInitialized(true);
      setTimeout(() => {
        setMapStyleLoaded(true);
      }, 100);
    });

    map.current.on('load', () => {
      if (!map.current) return;
      
      // 设置地图语言为中文
      map.current.setLanguage('zh-Hans');
      
      // 设置更清爽的雾化效果
      map.current.setFog({
        color: 'rgb(220, 245, 255)', 
        'high-color': 'rgb(180, 225, 255)', 
        'horizon-blend': 0.015, 
        'space-color': 'rgb(190, 230, 255)', 
        'star-intensity': 0.4, 
      });

      // 添加大气层效果
      map.current.setLight({
        anchor: 'viewport',
        color: 'white',
        intensity: 0.4,
        position: [1, 0, 0]
      });

      map.current.addSource('countries', {
        type: 'vector',
        url: 'mapbox://mapbox.country-boundaries-v1'
      });

      map.current.addLayer({
        id: 'countries-boundaries',
        type: 'line',
        source: 'countries',
        'source-layer': 'country_boundaries',
        layout: {},
        paint: {
          'line-color': 'rgba(100, 150, 200, 0.6)',
          'line-width': 1.2
        }
      });

      // 移除水域颜色层，因为outdoors-v12主题已经包含了良好的水域颜色
      // map.current.addLayer({
      //   id: 'water-color',
      //   type: 'fill',
      //   source: 'countries',
      //   'source-layer': 'water',
      //   paint: {
      //     'fill-color': 'rgba(170, 211, 223, 0.8)',
      //     'fill-opacity': 0.8
      //   }
      // }, 'countries-boundaries');

      // 添加地形高度渲染
      map.current.addSource('terrain-data', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512
      });

      // 设置地形
      map.current.setTerrain({
        source: 'terrain-data',
        exaggeration: 1.2 // 轻微夸大地形高度，使山脉更明显
      });

      setMapLoaded(true);
      addMarkers();
      highlightCountries();
      setupCountryInteractions();
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // 当地理编码请求状态变化时，检查是否所有请求都已完成
  useEffect(() => {
    if (pendingGeocodeRequests === 0 && !geocodeComplete) {
      setGeocodeComplete(true);
    }
  }, [pendingGeocodeRequests, geocodeComplete]);

  // 当书籍、播客或国家代码数据变化时，更新标记和高亮
  useEffect(() => {
    if (mapLoaded) {
      addMarkers();
      highlightCountries();
    }
  }, [books, podcasts, countryCodes, mapLoaded, showUserItems]);

  return (
    <div className={`relative ${className || "w-full h-full"}`}>
      {!mapStyleLoaded && (
        <div className="map-loading-overlay">
          <div className="text-lg font-medium text-gray-600">加载地图中...</div>
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full" />
      {pendingGeocodeRequests > 0 && (
        <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-md px-3 py-2 text-sm">
          正在加载标记... ({pendingGeocodeRequests})
        </div>
      )}
    </div>
  );
}

export default GlobeMap;
