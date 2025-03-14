import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface GlobeMapProps {
  className?: string;
}

function GlobeMap({ className }: GlobeMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

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
      style: 'mapbox://styles/mapbox/satellite-v9', // 使用卫星地图样式
      center: [0, 20], // 初始中心点
      zoom: 1.5, // 初始缩放级别
      projection: 'globe', // 使用球形投影
    });

    map.current.on('load', () => {
      if (!map.current) return;
      
      // 添加大气层效果
      map.current.setFog({
        color: 'rgb(186, 210, 235)', // 大气层颜色
        'high-color': 'rgb(36, 92, 223)', // 高空大气层颜色
        'horizon-blend': 0.02, // 地平线混合
        'space-color': 'rgb(11, 11, 25)', // 太空颜色
        'star-intensity': 0.6, // 星星亮度
      });

      setMapLoaded(true);
    });

    // 清理函数
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={mapContainer} 
      className={`w-full h-full min-h-[500px] rounded-lg ${className || ''}`}
    />
  );
}

export default GlobeMap;
