'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Download, 
  Undo2, 
  Redo2,
  MapPin, 
  Target, 
  Route,
  Square,
  Circle,
  Type,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Edit,
  Check,
  X,
  FileText
} from 'lucide-react';
import { userStorage, authStorage, strategyBoardStorage } from '@/lib/storage';
import { getMap } from '@/lib/fortnite-api';
import { StrategyBoard, BoardElement } from '@/types';

type ToolType = 'select' | 'marker' | 'text' | 'route' | 'area' | 'circle' | 'player-ally' | 'player-enemy';

interface CanvasState {
  scale: number;
  offsetX: number;
  offsetY: number;
}

interface DragState {
  isDragging: boolean;
  elementId: string | null;
  dragType: 'move' | 'resize' | 'pan' | null;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

export default function StrategyBoardEditPage() {
  const [board, setBoard] = useState<StrategyBoard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState<ToolType>('select');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<BoardElement[][]>([]);
  const [redoStack, setRedoStack] = useState<BoardElement[][]>([]);
  const [mapImage, setMapImage] = useState<HTMLImageElement | null>(null);
  const [isLoadingMap, setIsLoadingMap] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempBoardName, setTempBoardName] = useState('');
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [tempNotes, setTempNotes] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Canvas拡大・移動関連
  const [canvasState, setCanvasState] = useState<CanvasState>({
    scale: 1,
    offsetX: 0,
    offsetY: 0
  });
  
  // ドラッグ関連
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    elementId: null,
    dragType: null,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0
  });
  
  // ルート作成関連
  const [routeInProgress, setRouteInProgress] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const params = useParams();
  const boardId = params.id as string;

  useEffect(() => {
    // 認証チェック
    const user = userStorage.get();
    const token = authStorage.get();
    
    if (!user || !token) {
      router.push('/login');
      return;
    }

    loadBoard();
    // マップ読み込みは並行して行う（ブロックしない）
    loadFortniteMap();
  }, [router, boardId]);

  useEffect(() => {
    if (board && canvasRef.current) {
      // Canvas初期化
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Canvasのサイズをコンテナに合わせて動的に設定
        const container = containerRef.current;
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const availableWidth = containerRect.width - 40; // パディング分を除く
          const availableHeight = containerRect.height - 40;
          
          // 正方形のマップを表示するため、小さい方の寸法を基準にする
          const baseSize = Math.min(availableWidth, availableHeight);
          
          canvas.width = baseSize;
          canvas.height = baseSize;
          canvas.style.width = `${baseSize}px`;
          canvas.style.height = `${baseSize}px`;
        }
        
        // 初回描画を少し遅延させて確実に描画
        requestAnimationFrame(() => {
          drawCanvas();
        });
      }
    }
  }, [board, selectedElement, canvasState, mapImage]);

  // 未保存の変更がある場合のページ離脱警告
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '未保存の変更があります。本当にページを離れますか？';
        return '未保存の変更があります。本当にページを離れますか？';
      }
    };

    const handlePopState = () => {
      if (hasUnsavedChanges) {
        const shouldLeave = window.confirm('未保存の変更があります。本当にページを離れますか？');
        if (!shouldLeave) {
          window.history.pushState(null, '', window.location.href);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges]);

  // ウィンドウリサイズ時の処理
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        const containerRect = container.getBoundingClientRect();
        const availableWidth = containerRect.width - 40;
        const availableHeight = containerRect.height - 40;
        
        // 正方形のマップを表示するため、小さい方の寸法を基準にする
        const baseSize = Math.min(availableWidth, availableHeight);
        
        canvas.width = baseSize;
        canvas.height = baseSize;
        canvas.style.width = `${baseSize}px`;
        canvas.style.height = `${baseSize}px`;
        
        drawCanvas();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [board]);

  const loadBoard = () => {
    setIsLoading(true);
    try {
      const savedBoard = strategyBoardStorage.get(boardId);
      if (savedBoard) {
        setBoard(savedBoard);
        setTempBoardName(savedBoard.name);
        setTempNotes(savedBoard.notes || '');
        // ボードが読み込まれたら即座にCanvas描画可能
        setIsLoading(false);
      } else {
        router.push('/strategy-board');
      }
    } catch (error) {
      console.error('Failed to load board:', error);
      router.push('/strategy-board');
    }
  };

  const loadFortniteMap = async () => {
    setIsLoadingMap(true);
    try {
      const mapData = await getMap();
      
      // 画像を事前に読み込み
      const img = new Image();
      // CORS問題を回避するため、crossOriginを削除
      img.onload = () => {
        setMapImage(img);
        setIsLoadingMap(false);
        // マップ読み込み完了後に再描画
        if (canvasRef.current) {
          drawCanvas();
        }
      };
      img.onerror = (error) => {
        console.error('Failed to load map image:', error);
        setIsLoadingMap(false);
        // フォールバック: プレースホルダー画像を作成
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 2048;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // グラデーション背景
          const gradient = ctx.createLinearGradient(0, 0, 2048, 2048);
          gradient.addColorStop(0, '#0f172a');
          gradient.addColorStop(1, '#1e293b');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 2048, 2048);
          
          // グリッド描画
          ctx.strokeStyle = '#374151';
          ctx.lineWidth = 2;
          for (let i = 0; i <= 2048; i += 256) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 2048);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(2048, i);
            ctx.stroke();
          }
          
          // 中央にテキスト
          ctx.fillStyle = '#9ca3af';
          ctx.font = '48px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Fortnite Map', 1024, 1000);
          ctx.fillText('Loading...', 1024, 1080);
          
          // プレースホルダー画像を作成
          const placeholderImg = new Image();
          placeholderImg.onload = () => {
            setMapImage(placeholderImg);
            if (canvasRef.current) {
              drawCanvas();
            }
          };
          placeholderImg.src = canvas.toDataURL();
        }
      };
      
      // マップ画像のURLを設定
      img.src = mapData.imageUrl;
    } catch (error) {
      console.error('Failed to load map:', error);
      setIsLoadingMap(false);
      // エラー時もプレースホルダーを表示
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 2048;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(0, 0, 2048, 2048);
        
        ctx.fillStyle = '#6b7280';
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Map Unavailable', 1024, 1024);
        
        const errorImg = new Image();
        errorImg.onload = () => {
          setMapImage(errorImg);
          if (canvasRef.current) {
            drawCanvas();
          }
        };
        errorImg.src = canvas.toDataURL();
      }
    }
  };

  const saveBoard = () => {
    if (board) {
      const updatedBoard = {
        ...board,
        notes: tempNotes,
        updatedAt: new Date().toISOString()
      };
      strategyBoardStorage.save(updatedBoard);
      setBoard(updatedBoard);
      setHasUnsavedChanges(false);
    }
  };

  const saveBoardName = () => {
    if (board && tempBoardName.trim()) {
      const updatedBoard = {
        ...board,
        name: tempBoardName.trim(),
        notes: tempNotes,
        updatedAt: new Date().toISOString()
      };
      strategyBoardStorage.save(updatedBoard);
      setBoard(updatedBoard);
      setIsEditingName(false);
      setHasUnsavedChanges(false);
    }
  };

  const cancelEditName = () => {
    setTempBoardName(board?.name || '');
    setIsEditingName(false);
  };

  // 変更があった時に未保存フラグを設定
  const markAsUnsaved = () => {
    setHasUnsavedChanges(true);
  };

  const addToUndoStack = () => {
    if (board) {
      setUndoStack(prev => [...prev.slice(-9), [...board.elements]]);
      setRedoStack([]);
      markAsUnsaved();
    }
  };

  const undo = () => {
    if (undoStack.length > 0 && board) {
      const lastState = undoStack[undoStack.length - 1];
      setRedoStack(prev => [[...board.elements], ...prev.slice(0, 9)]);
      setUndoStack(prev => prev.slice(0, -1));
      setBoard(prev => prev ? { ...prev, elements: [...lastState] } : null);
      markAsUnsaved();
    }
  };

  const redo = () => {
    if (redoStack.length > 0 && board) {
      const nextState = redoStack[0];
      setUndoStack(prev => [...prev, [...board.elements]]);
      setRedoStack(prev => prev.slice(1));
      setBoard(prev => prev ? { ...prev, elements: [...nextState] } : null);
      markAsUnsaved();
    }
  };

  // Canvas座標変換を修正
  const screenToCanvas = (screenX: number, screenY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    // スクリーン座標からCanvas座標への変換
    const canvasX = screenX - rect.left;
    const canvasY = screenY - rect.top;
    
    // Canvas表示座標からワールド座標への変換
    const worldX = (canvasX - canvasState.offsetX) / canvasState.scale;
    const worldY = (canvasY - canvasState.offsetY) / canvasState.scale;
    
    return { x: worldX, y: worldY };
  };

  const canvasToScreen = (canvasX: number, canvasY: number) => {
    return {
      x: canvasX * canvasState.scale + canvasState.offsetX,
      y: canvasY * canvasState.scale + canvasState.offsetY
    };
  };

  // ズーム機能を修正
  const zoomIn = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    setCanvasState(prev => {
      const newScale = Math.min(prev.scale * 1.2, 3);
      const scaleRatio = newScale / prev.scale;
      
      return {
        scale: newScale,
        offsetX: centerX - (centerX - prev.offsetX) * scaleRatio,
        offsetY: centerY - (centerY - prev.offsetY) * scaleRatio
      };
    });
  };

  const zoomOut = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    setCanvasState(prev => {
      const newScale = Math.max(prev.scale / 1.2, 0.2);
      const scaleRatio = newScale / prev.scale;
      
      return {
        scale: newScale,
        offsetX: centerX - (centerX - prev.offsetX) * scaleRatio,
        offsetY: centerY - (centerY - prev.offsetY) * scaleRatio
      };
    });
  };

  const resetZoom = () => {
    setCanvasState({
      scale: 1,
      offsetX: 0,
      offsetY: 0
    });
  };

  // マウスホイールでのズーム
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    setCanvasState(prev => {
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(0.2, Math.min(3, prev.scale * zoomFactor));
      
      // マウス位置を中心にズーム
      const scaleRatio = newScale / prev.scale;
      const newOffsetX = mouseX - (mouseX - prev.offsetX) * scaleRatio;
      const newOffsetY = mouseY - (mouseY - prev.offsetY) * scaleRatio;
      
      return {
        scale: newScale,
        offsetX: newOffsetX,
        offsetY: newOffsetY
      };
    });
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !board) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // キャンバスクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 変換行列を適用
    ctx.save();
    ctx.translate(canvasState.offsetX, canvasState.offsetY);
    ctx.scale(canvasState.scale, canvasState.scale);

    // マップの正方形ベースサイズ（Fortniteマップは正方形）
    const mapSize = Math.min(canvas.width, canvas.height);
    
    if (mapImage) {
      // マップ画像を正方形で描画（アスペクト比を保持）
      ctx.drawImage(mapImage, 0, 0, mapSize, mapSize);
    } else {
      // マップ画像がない場合はプレースホルダー背景を描画
      // グラデーション背景
      const gradient = ctx.createLinearGradient(0, 0, mapSize, mapSize);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(0.5, '#16213e');
      gradient.addColorStop(1, '#0f172a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, mapSize, mapSize);
      
      // プレースホルダーテキスト
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('FORTNITE MAP', mapSize / 2, mapSize / 2 - 50);
      
      ctx.font = '24px Arial';
      if (isLoadingMap) {
        ctx.fillText('マップを読み込み中...', mapSize / 2, mapSize / 2 + 20);
      } else {
        ctx.fillText('マップの読み込みに失敗しました', mapSize / 2, mapSize / 2 + 20);
      }
      
      // 境界線
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, mapSize - 40, mapSize - 40);
      
      ctx.textAlign = 'start'; // リセット
    }

    // 背景グリッド描画（正方形サイズ）
    drawGrid(ctx, mapSize, mapSize);

    // 要素描画
    board.elements.forEach(element => {
      drawElement(ctx, element, element.id === selectedElement);
    });

    ctx.restore();
  };

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 50;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;

    // グリッドの線を描画
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawElement = (ctx: CanvasRenderingContext2D, element: BoardElement, isSelected: boolean) => {
    ctx.save();

    if (isSelected) {
      ctx.shadowColor = '#8B5CF6';
      ctx.shadowBlur = 10;
    }

    switch (element.type) {
      case 'marker':
        drawMarker(ctx, element);
        break;
      case 'text':
        drawText(ctx, element);
        break;
      case 'route':
        drawRoute(ctx, element);
        break;
      case 'area':
        drawArea(ctx, element);
        break;
      case 'circle':
        drawCircle(ctx, element);
        break;
      case 'player-ally':
      case 'player-enemy':
        drawPlayer(ctx, element);
        break;
    }

    // 選択された要素にリサイズハンドルを描画
    if (isSelected && (element.type === 'area' || element.type === 'circle')) {
      drawResizeHandles(ctx, element);
    }

    ctx.restore();
  };

  const drawMarker = (ctx: CanvasRenderingContext2D, element: BoardElement) => {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.fillStyle = element.style?.color || '#EF4444';
    
    ctx.beginPath();
    ctx.arc(element.x, element.y, 8, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
    
    // マーカーの影
    ctx.beginPath();
    ctx.moveTo(element.x, element.y + 8);
    ctx.lineTo(element.x - 4, element.y + 16);
    ctx.lineTo(element.x + 4, element.y + 16);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  };

  const drawText = (ctx: CanvasRenderingContext2D, element: BoardElement) => {
    const fontSize = (element.style?.fontSize || 16);
    ctx.font = `bold ${fontSize}px Arial`;
    
    // テキストに黒い境界線を追加
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeText(element.text || '', element.x, element.y);
    
    // テキスト本体
    ctx.fillStyle = element.style?.color || '#FFFFFF';
    ctx.fillText(element.text || '', element.x, element.y);
  };

  const drawRoute = (ctx: CanvasRenderingContext2D, element: BoardElement) => {
    if (!element.points || element.points.length < 2) return;
    
    const strokeWidth = (element.style?.strokeWidth || 3);
    
    // 外側の黒い線（境界線）
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = strokeWidth + 2;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(element.points[0].x, element.points[0].y);
    for (let i = 1; i < element.points.length; i++) {
      ctx.lineTo(element.points[i].x, element.points[i].y);
    }
    ctx.stroke();
    
    // 内側の色付き線
    ctx.strokeStyle = element.style?.color || '#3B82F6';
    ctx.lineWidth = strokeWidth;
    
    ctx.beginPath();
    ctx.moveTo(element.points[0].x, element.points[0].y);
    for (let i = 1; i < element.points.length; i++) {
      ctx.lineTo(element.points[i].x, element.points[i].y);
    }
    ctx.stroke();

    // 矢印を末端に描画
    if (element.points.length >= 2) {
      const lastPoint = element.points[element.points.length - 1];
      const secondLastPoint = element.points[element.points.length - 2];
      drawArrow(ctx, secondLastPoint, lastPoint);
    }
  };

  const drawArea = (ctx: CanvasRenderingContext2D, element: BoardElement) => {
    const width = element.width || 100;
    const height = element.height || 100;
    
    // 外側の境界線
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeRect(element.x, element.y, width, height);
    
    // 塗りつぶし
    ctx.fillStyle = element.style?.color || 'rgba(34, 197, 94, 0.3)';
    ctx.fillRect(element.x, element.y, width, height);
    
    // 内側の境界線
    ctx.strokeStyle = element.style?.borderColor || '#22C55E';
    ctx.lineWidth = 2;
    ctx.strokeRect(element.x, element.y, width, height);
  };

  const drawCircle = (ctx: CanvasRenderingContext2D, element: BoardElement) => {
    const radius = element.radius || 50;
    
    // 外側の境界線
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(element.x, element.y, radius, 0, 2 * Math.PI);
    ctx.stroke();
    
    // 塗りつぶし
    ctx.fillStyle = element.style?.color || 'rgba(168, 85, 247, 0.3)';
    ctx.beginPath();
    ctx.arc(element.x, element.y, radius, 0, 2 * Math.PI);
    ctx.fill();
    
    // 内側の境界線
    ctx.strokeStyle = element.style?.borderColor || '#A855F7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(element.x, element.y, radius, 0, 2 * Math.PI);
    ctx.stroke();
  };

  const drawResizeHandles = (ctx: CanvasRenderingContext2D, element: BoardElement) => {
    const handleSize = 8;
    
    ctx.fillStyle = '#8B5CF6';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;

    if (element.type === 'area') {
      const width = element.width || 100;
      const height = element.height || 100;
      
      // 右下のリサイズハンドル
      ctx.fillRect(element.x + width - handleSize/2, element.y + height - handleSize/2, handleSize, handleSize);
      ctx.strokeRect(element.x + width - handleSize/2, element.y + height - handleSize/2, handleSize, handleSize);
    } else if (element.type === 'circle') {
      const radius = element.radius || 50;
      
      // 右端のリサイズハンドル
      ctx.beginPath();
      ctx.arc(element.x + radius, element.y, handleSize/2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, from: {x: number, y: number}, to: {x: number, y: number}) => {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const arrowLength = 15;
    const arrowAngle = Math.PI / 6;

    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
      to.x - arrowLength * Math.cos(angle - arrowAngle),
      to.y - arrowLength * Math.sin(angle - arrowAngle)
    );
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
      to.x - arrowLength * Math.cos(angle + arrowAngle),
      to.y - arrowLength * Math.sin(angle + arrowAngle)
    );
    ctx.stroke();
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D, element: BoardElement) => {
    if (!element.playerInfo) return;
    
    const { team, name, health = 100, shield = 100 } = element.playerInfo;
    const isAlly = team === 'ally';
    const playerSize = 16;
    
    // プレイヤーアイコンの色設定
    const bodyColor = isAlly ? '#3B82F6' : '#EF4444'; // 青=味方、赤=敵
    const outlineColor = '#000000';
    
    // 外側の境界線
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 3;
    
    // プレイヤーの体（円形）
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(element.x, element.y, playerSize, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
    
    // プレイヤーの向き（三角形）
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(element.x, element.y - 8);
    ctx.lineTo(element.x - 6, element.y + 4);
    ctx.lineTo(element.x + 6, element.y + 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // チームアイコン
    const iconY = element.y - playerSize - 12;
    ctx.fillStyle = bodyColor;
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(isAlly ? '👤' : '💀', element.x, iconY);
    
    // プレイヤー名
    if (name) {
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      
      const nameY = element.y + playerSize + 16;
      ctx.strokeText(name, element.x, nameY);
      ctx.fillText(name, element.x, nameY);
    }
    
    // ヘルス・シールドバー
    const barWidth = 30;
    const barHeight = 4;
    const barY = element.y + playerSize + 25;
    
    // シールドバー（背景）
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(element.x - barWidth/2, barY, barWidth, barHeight);
    
    // シールドバー（実際の値）
    ctx.fillStyle = '#3B82F6';
    const shieldWidth = (shield / 100) * barWidth;
    ctx.fillRect(element.x - barWidth/2, barY, shieldWidth, barHeight);
    
    // ヘルスバー（背景）
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(element.x - barWidth/2, barY + 6, barWidth, barHeight);
    
    // ヘルスバー（実際の値）
    ctx.fillStyle = '#22C55E';
    const healthWidth = (health / 100) * barWidth;
    ctx.fillRect(element.x - barWidth/2, barY + 6, healthWidth, barHeight);
    
    // リセット
    ctx.textAlign = 'start';
  };

  // マウスイベント処理を修正
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!board || !canvasRef.current) return;

    const { x, y } = screenToCanvas(e.clientX, e.clientY);

    if (selectedTool === 'select') {
      const clickedElement = findElementAtPosition(x, y);
      if (clickedElement) {
        setSelectedElement(clickedElement.id);
        
        // リサイズハンドルをクリックしたかチェック
        const isResizeHandle = getResizeHandleAtPosition(x, y, clickedElement);
        if (isResizeHandle) {
          setDragState({
            isDragging: true,
            elementId: clickedElement.id,
            dragType: 'resize',
            startX: x,
            startY: y,
            offsetX: 0,
            offsetY: 0
          });
        } else {
          setDragState({
            isDragging: true,
            elementId: clickedElement.id,
            dragType: 'move',
            startX: x,
            startY: y,
            offsetX: x - clickedElement.x,
            offsetY: y - clickedElement.y
          });
        }
      } else {
        // 要素がない場合はマップをパンニング
        setSelectedElement(null);
        setDragState({
          isDragging: true,
          elementId: null,
          dragType: 'pan',
          startX: e.clientX,
          startY: e.clientY,
          offsetX: canvasState.offsetX,
          offsetY: canvasState.offsetY
        });
      }
    } else if (selectedTool === 'route') {
      if (routeInProgress) {
        // 既存のルートに点を追加
        addPointToRoute(routeInProgress, x, y);
      } else {
        // 新しいルートを開始
        startNewRoute(x, y);
      }
    } else {
      // 新要素追加
      addElement(x, y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!board || !canvasRef.current || !dragState.isDragging) return;

    if (dragState.dragType === 'pan') {
      // マップパンニング
      const deltaX = e.clientX - dragState.startX;
      const deltaY = e.clientY - dragState.startY;
      
      setCanvasState(prev => ({
        ...prev,
        offsetX: dragState.offsetX + deltaX,
        offsetY: dragState.offsetY + deltaY
      }));
    } else {
      const { x, y } = screenToCanvas(e.clientX, e.clientY);

      if (dragState.elementId) {
        const element = board.elements.find(el => el.id === dragState.elementId);
        if (element) {
          if (dragState.dragType === 'move') {
            const newX = x - dragState.offsetX;
            const newY = y - dragState.offsetY;
            
            setBoard(prev => prev ? {
              ...prev,
              elements: prev.elements.map(el => 
                el.id === dragState.elementId 
                  ? { ...el, x: newX, y: newY }
                  : el
              )
            } : null);
          } else if (dragState.dragType === 'resize') {
            const deltaX = x - dragState.startX;
            const deltaY = y - dragState.startY;
            
            setBoard(prev => prev ? {
              ...prev,
              elements: prev.elements.map(el => {
                if (el.id === dragState.elementId) {
                  if (el.type === 'area') {
                    const currentWidth = el.width || 100;
                    const currentHeight = el.height || 100;
                    return {
                      ...el,
                      width: Math.max(20, currentWidth + deltaX),
                      height: Math.max(20, currentHeight + deltaY)
                    };
                  } else if (el.type === 'circle') {
                    const currentRadius = el.radius || 50;
                    const deltaRadius = Math.sqrt(deltaX * deltaX + deltaY * deltaY) * (deltaX > 0 ? 1 : -1);
                    return {
                      ...el,
                      radius: Math.max(10, currentRadius + deltaRadius)
                    };
                  }
                }
                return el;
              })
            } : null);
            
            // リサイズ中は開始位置を更新
            setDragState(prev => ({
              ...prev,
              startX: x,
              startY: y
            }));
          }
        }
      }
    }
  };

  const handleMouseUp = () => {
    if (dragState.isDragging) {
      addToUndoStack();
    }
    setDragState({
      isDragging: false,
      elementId: null,
      dragType: null,
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0
    });
  };

  // テキスト編集機能を追加
  const handleTextEdit = (elementId: string, newText: string) => {
    addToUndoStack();
    setBoard(prev => prev ? {
      ...prev,
      elements: prev.elements.map(el => 
        el.id === elementId 
          ? { ...el, text: newText }
          : el
      )
    } : null);
  };

  // ダブルクリックでテキスト編集
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (selectedTool === 'select') {
      const { x, y } = screenToCanvas(e.clientX, e.clientY);
      const clickedElement = findElementAtPosition(x, y);
      
      if (clickedElement && clickedElement.type === 'text') {
        const newText = prompt('テキストを編集してください:', clickedElement.text || '');
        if (newText !== null) {
          handleTextEdit(clickedElement.id, newText);
        }
        return;
      }
    }

    // ルート作成を終了
    if (routeInProgress) {
      setRouteInProgress(null);
    }
  };

  const findElementAtPosition = (x: number, y: number): BoardElement | null => {
    if (!board) return null;

    // 逆順で検索（上に描画された要素が優先）
    for (let i = board.elements.length - 1; i >= 0; i--) {
      const element = board.elements[i];
      if (isPointInElement(x, y, element)) {
        return element;
      }
    }
    return null;
  };

  const isPointInElement = (x: number, y: number, element: BoardElement): boolean => {
    const tolerance = 10; // クリック判定の許容範囲
    
    switch (element.type) {
      case 'marker':
        return Math.sqrt(Math.pow(x - element.x, 2) + Math.pow(y - element.y, 2)) <= 12 + tolerance;
      case 'text':
        // テキストの推定サイズ
        const textWidth = (element.text || '').length * 10;
        const textHeight = 20;
        return x >= element.x - tolerance && x <= element.x + textWidth + tolerance &&
               y >= element.y - textHeight - tolerance && y <= element.y + tolerance;
      case 'area':
        const width = element.width || 100;
        const height = element.height || 100;
        return x >= element.x - tolerance && x <= element.x + width + tolerance &&
               y >= element.y - tolerance && y <= element.y + height + tolerance;
      case 'circle':
        const radius = element.radius || 50;
        return Math.sqrt(Math.pow(x - element.x, 2) + Math.pow(y - element.y, 2)) <= radius + tolerance;
      case 'player-ally':
      case 'player-enemy':
        return Math.sqrt(Math.pow(x - element.x, 2) + Math.pow(y - element.y, 2)) <= 16 + tolerance;
      case 'route':
        if (!element.points || element.points.length < 2) return false;
        // ルート線上の判定
        for (let i = 0; i < element.points.length - 1; i++) {
          const p1 = element.points[i];
          const p2 = element.points[i + 1];
          const distance = distancePointToLine(x, y, p1.x, p1.y, p2.x, p2.y);
          if (distance <= 10 + tolerance) return true;
        }
        return false;
      default:
        return false;
    }
  };

  const distancePointToLine = (px: number, py: number, x1: number, y1: number, x2: number, y2: number): number => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const startNewRoute = (x: number, y: number) => {
    addToUndoStack();

    const newElement: BoardElement = {
      id: `element-${Date.now()}`,
      type: 'route',
      x,
      y,
      points: [{ x, y }],
      style: {
        color: '#3B82F6',
        strokeWidth: 3
      }
    };

    setBoard(prev => prev ? {
      ...prev,
      elements: [...prev.elements, newElement]
    } : null);

    setRouteInProgress(newElement.id);
  };

  const addPointToRoute = (routeId: string, x: number, y: number) => {
    setBoard(prev => prev ? {
      ...prev,
      elements: prev.elements.map(el => 
        el.id === routeId && el.points
          ? { ...el, points: [...el.points, { x, y }] }
          : el
      )
    } : null);
  };

  const addElement = (x: number, y: number) => {
    if (!board) return;

    addToUndoStack();

    const newElement: BoardElement = {
      id: `element-${Date.now()}`,
      type: selectedTool as any,
      x: x,
      y: y,
      style: {
        color: getDefaultColor(selectedTool),
        fontSize: 16,
        strokeWidth: 3
      }
    };

    if (selectedTool === 'text') {
      newElement.text = 'テキスト';
    } else if (selectedTool === 'area') {
      newElement.width = 100;
      newElement.height = 100;
    } else if (selectedTool === 'circle') {
      newElement.radius = 50;
    } else if (selectedTool === 'player-ally') {
      newElement.playerInfo = {
        team: 'ally',
        name: `味方${board.elements.filter(e => e.type === 'player-ally').length + 1}`,
        health: 100,
        shield: 100
      };
    } else if (selectedTool === 'player-enemy') {
      newElement.playerInfo = {
        team: 'enemy',
        name: `敵${board.elements.filter(e => e.type === 'player-enemy').length + 1}`,
        health: 100,
        shield: 100
      };
    }

    setBoard(prev => prev ? {
      ...prev,
      elements: [...prev.elements, newElement]
    } : null);
    
    // 新しく作成した要素を選択
    setSelectedElement(newElement.id);
  };

  const getDefaultColor = (tool: ToolType): string => {
    switch (tool) {
      case 'marker': return '#EF4444';
      case 'text': return '#FFFFFF';
      case 'route': return '#3B82F6';
      case 'area': return 'rgba(34, 197, 94, 0.3)';
      case 'circle': return 'rgba(168, 85, 247, 0.3)';
      case 'player-ally': return '#3B82F6';
      case 'player-enemy': return '#EF4444';
      default: return '#FFFFFF';
    }
  };

  const deleteSelectedElement = () => {
    if (!board || !selectedElement) return;

    addToUndoStack();
    setBoard(prev => prev ? {
      ...prev,
      elements: prev.elements.filter(el => el.id !== selectedElement)
    } : null);
    setSelectedElement(null);
  };

  // リサイズハンドルの位置判定
  const getResizeHandleAtPosition = (x: number, y: number, element: BoardElement): boolean => {
    const handleSize = 8;
    
    if (element.type === 'area') {
      const width = element.width || 100;
      const height = element.height || 100;
      const handleX = element.x + width - handleSize/2;
      const handleY = element.y + height - handleSize/2;
      
      return x >= handleX && x <= handleX + handleSize &&
             y >= handleY && y <= handleY + handleSize;
    } else if (element.type === 'circle') {
      const radius = element.radius || 50;
      const handleX = element.x + radius;
      const handleY = element.y;
      
      return Math.sqrt((x - handleX) ** 2 + (y - handleY) ** 2) <= handleSize/2;
    }
    
    return false;
  };

  const tools = [
    { type: 'select', icon: <Move className="w-4 h-4" />, label: '選択' },
    { type: 'marker', icon: <MapPin className="w-4 h-4" />, label: 'マーカー' },
    { type: 'text', icon: <Type className="w-4 h-4" />, label: 'テキスト' },
    { type: 'route', icon: <Route className="w-4 h-4" />, label: 'ルート' },
    { type: 'area', icon: <Square className="w-4 h-4" />, label: 'エリア' },
    { type: 'circle', icon: <Circle className="w-4 h-4" />, label: '円' },
    { type: 'player-ally', icon: <div className="text-blue-400">👤</div>, label: '味方' },
    { type: 'player-enemy', icon: <div className="text-red-400">💀</div>, label: '敵' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-300">戦略ボードを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  if (!board) {
    return null;
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* ヘッダー */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/strategy-board"
                className="text-purple-300 hover:text-white transition-colors flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                戦略ボード一覧
              </Link>
              
              {isEditingName ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={tempBoardName}
                    onChange={(e) => {
                      setTempBoardName(e.target.value);
                      markAsUnsaved();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveBoardName();
                      if (e.key === 'Escape') cancelEditName();
                    }}
                    className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-xl font-bold focus:outline-none focus:border-blue-400"
                    placeholder="ボード名を入力"
                    autoFocus
                  />
                  <button
                    onClick={saveBoardName}
                    className="p-1 text-green-400 hover:text-green-300 transition-colors"
                    title="保存 (Enter)"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cancelEditName}
                    className="p-1 text-red-400 hover:text-red-300 transition-colors"
                    title="キャンセル (Esc)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-bold text-white">{board.name}</h1>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    title="名前を編集"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={undo}
                disabled={undoStack.length === 0}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
                title="元に戻す"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={redo}
                disabled={redoStack.length === 0}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
                title="やり直し"
              >
                <Redo2 className="w-4 h-4" />
              </button>
              <button
                onClick={loadFortniteMap}
                disabled={isLoadingMap}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
                title="マップを更新"
              >
                <Download className={`w-4 h-4 ${isLoadingMap ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={saveBoard}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                  hasUnsavedChanges 
                    ? 'bg-orange-600 text-white hover:bg-orange-700 animate-pulse' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>{hasUnsavedChanges ? '保存が必要' : '保存済み'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* ツールパネル */}
        <div className="w-80 border-r border-gray-800 bg-black/20 p-4 overflow-y-auto">
          <div className="space-y-6">
            {/* ツール選択 */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">ツール</h3>
              <div className="grid grid-cols-2 gap-2">
                {tools.map((tool) => (
                  <button
                    key={tool.type}
                    onClick={() => {
                      setSelectedTool(tool.type as ToolType);
                      if (tool.type !== 'route') {
                        setRouteInProgress(null);
                      }
                    }}
                    className={`p-3 rounded-lg border transition-colors flex flex-col items-center space-y-1 ${
                      selectedTool === tool.type
                        ? 'bg-blue-600 border-blue-400 text-white'
                        : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {tool.icon}
                    <span className="text-xs">{tool.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ズームコントロール */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">表示</h3>
              <div className="space-y-2">
                <button
                  onClick={zoomIn}
                  className="w-full p-2 bg-white/5 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center space-x-2"
                >
                  <ZoomIn className="w-4 h-4" />
                  <span>拡大</span>
                </button>
                <button
                  onClick={zoomOut}
                  className="w-full p-2 bg-white/5 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center space-x-2"
                >
                  <ZoomOut className="w-4 h-4" />
                  <span>縮小</span>
                </button>
                <button
                  onClick={resetZoom}
                  className="w-full p-2 bg-white/5 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>リセット</span>
                </button>
                <div className="text-center text-sm text-gray-400">
                  ズーム: {Math.round(canvasState.scale * 100)}%
                </div>
              </div>
            </div>

            {/* 要素リスト */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">要素 ({board.elements.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {board.elements.map((element) => (
                  <div
                    key={element.id}
                    onClick={() => setSelectedElement(element.id)}
                    className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                      selectedElement === element.id
                        ? 'bg-purple-600/20 border-purple-400'
                        : 'bg-white/5 border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm">
                        {element.type === 'marker' && '📍'}
                        {element.type === 'text' && '📝'}
                        {element.type === 'route' && '🛣️'}
                        {element.type === 'area' && '🔲'}
                        {element.type === 'circle' && '🔵'}
                        {element.type === 'player-ally' && '👤'}
                        {element.type === 'player-enemy' && '💀'}
                        {element.text || element.playerInfo?.name || `${element.type}`}
                      </span>
                      {selectedElement === element.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSelectedElement();
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Target className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 選択された要素の詳細編集 */}
            {selectedElement && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">要素編集</h3>
                {(() => {
                  const element = board.elements.find(el => el.id === selectedElement);
                  if (!element) return null;
                  
                  return (
                    <div className="space-y-3">
                      <div className="text-sm text-gray-300">
                        種類: {element.type}
                      </div>
                      <div className="text-sm text-gray-300">
                        位置: ({Math.round(element.x)}, {Math.round(element.y)})
                      </div>
                      
                      {element.type === 'text' && (
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">テキスト</label>
                          <input
                            type="text"
                            value={element.text || ''}
                            onChange={(e) => handleTextEdit(element.id, e.target.value)}
                            className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                            placeholder="テキストを入力"
                          />
                        </div>
                      )}
                      
                      {(element.type === 'player-ally' || element.type === 'player-enemy') && element.playerInfo && (
                        <>
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">プレイヤー名</label>
                            <input
                              type="text"
                              value={element.playerInfo.name || ''}
                              onChange={(e) => {
                                addToUndoStack();
                                setBoard(prev => prev ? {
                                  ...prev,
                                  elements: prev.elements.map(el => 
                                    el.id === selectedElement 
                                      ? { 
                                          ...el, 
                                          playerInfo: { 
                                            ...el.playerInfo!, 
                                            name: e.target.value 
                                          } 
                                        }
                                      : el
                                  )
                                } : null);
                              }}
                              className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                              placeholder="プレイヤー名"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-sm text-gray-300 mb-1">体力</label>
                              <input
                                type="number"
                                value={element.playerInfo.health || 100}
                                onChange={(e) => {
                                  const health = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                                  addToUndoStack();
                                  setBoard(prev => prev ? {
                                    ...prev,
                                    elements: prev.elements.map(el => 
                                      el.id === selectedElement 
                                        ? { 
                                            ...el, 
                                            playerInfo: { 
                                              ...el.playerInfo!, 
                                              health 
                                            } 
                                          }
                                        : el
                                    )
                                  } : null);
                                }}
                                className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                                min="0"
                                max="100"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-300 mb-1">シールド</label>
                              <input
                                type="number"
                                value={element.playerInfo.shield || 100}
                                onChange={(e) => {
                                  const shield = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                                  addToUndoStack();
                                  setBoard(prev => prev ? {
                                    ...prev,
                                    elements: prev.elements.map(el => 
                                      el.id === selectedElement 
                                        ? { 
                                            ...el, 
                                            playerInfo: { 
                                              ...el.playerInfo!, 
                                              shield 
                                            } 
                                          }
                                        : el
                                    )
                                  } : null);
                                }}
                                className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                                min="0"
                                max="100"
                              />
                            </div>
                          </div>
                          <div className="text-xs text-gray-400">
                            チーム: {element.playerInfo.team === 'ally' ? '味方' : '敵'}
                          </div>
                        </>
                      )}
                      
                      {element.type === 'area' && (
                        <>
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">幅</label>
                            <input
                              type="number"
                              value={Math.round(element.width || 100)}
                              onChange={(e) => {
                                const width = parseInt(e.target.value) || 100;
                                addToUndoStack();
                                setBoard(prev => prev ? {
                                  ...prev,
                                  elements: prev.elements.map(el => 
                                    el.id === selectedElement ? { ...el, width } : el
                                  )
                                } : null);
                              }}
                              className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                              min="20"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">高さ</label>
                            <input
                              type="number"
                              value={Math.round(element.height || 100)}
                              onChange={(e) => {
                                const height = parseInt(e.target.value) || 100;
                                addToUndoStack();
                                setBoard(prev => prev ? {
                                  ...prev,
                                  elements: prev.elements.map(el => 
                                    el.id === selectedElement ? { ...el, height } : el
                                  )
                                } : null);
                              }}
                              className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                              min="20"
                            />
                          </div>
                        </>
                      )}
                      
                      {element.type === 'circle' && (
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">半径</label>
                          <input
                            type="number"
                            value={Math.round(element.radius || 50)}
                            onChange={(e) => {
                              const radius = parseInt(e.target.value) || 50;
                              addToUndoStack();
                              setBoard(prev => prev ? {
                                ...prev,
                                elements: prev.elements.map(el => 
                                  el.id === selectedElement ? { ...el, radius } : el
                                )
                              } : null);
                            }}
                            className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                            min="10"
                          />
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* キャンバスエリア */}
        <div ref={containerRef} className="flex-1 bg-gray-900 p-4 relative">
          {/* マップローディング表示 */}
          {isLoadingMap && (
            <div className="absolute top-4 right-4 z-10 bg-black/70 text-white px-3 py-2 rounded-lg flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span className="text-sm">マップ読み込み中...</span>
            </div>
          )}

          {/* 右端中央のメモボタン */}
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20">
            <button
              onClick={() => setIsNotesOpen(!isNotesOpen)}
              className={`p-3 rounded-l-lg border-l border-t border-b border-gray-600 transition-all duration-300 ${
                isNotesOpen 
                  ? 'bg-blue-600 text-white transform -translate-x-1' 
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
              }`}
              title="作戦メモ"
            >
              <FileText className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center justify-center w-full h-full">
            <canvas
              ref={canvasRef}
              className="border border-gray-700 rounded cursor-crosshair bg-gray-800"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onDoubleClick={handleDoubleClick}
              onWheel={handleWheel}
            />
          </div>
        </div>

        {/* 作戦メモサイドパネル */}
        <div className={`fixed right-0 top-0 w-80 h-full bg-gray-900 border-l border-gray-800 z-30 transition-transform duration-300 ease-in-out shadow-2xl ${
          isNotesOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>作戦メモ</span>
              </h3>
              <button
                onClick={() => setIsNotesOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col space-y-4">
              <textarea
                value={tempNotes}
                onChange={(e) => {
                  setTempNotes(e.target.value);
                  markAsUnsaved();
                }}
                placeholder="ここに作戦メモを入力してください...

例:
• 降下地点: ティルテッドタワー
• 初期ルート: 西→南
• エンドゲーム戦略: 高所確保
• 役割分担: アサルト2名、サポート1名"
                className="flex-1 bg-white/5 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-400"
                style={{ minHeight: '300px' }}
              />
              
              <div className="text-xs text-gray-400">
                {tempNotes.length}/2000文字 | 自動保存
              </div>
              
              {/* 便利な操作ボタン */}
              <div className="space-y-2">
                <button
                  onClick={() => setTempNotes('')}
                  className="w-full p-2 bg-red-600/20 border border-red-600/50 text-red-300 rounded-lg hover:bg-red-600/30 transition-colors text-sm"
                >
                  メモをクリア
                </button>
                <button
                  onClick={() => {
                    const template = `【作戦メモ】
作成日: ${new Date().toLocaleDateString('ja-JP')}

■ 降下地点
・

■ 初期戦略
・

■ 中盤戦略
・

■ エンドゲーム
・

■ 役割分担
・

■ 注意点
・`;
                    setTempNotes(template);
                    markAsUnsaved();
                  }}
                  className="w-full p-2 bg-blue-600/20 border border-blue-600/50 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-colors text-sm"
                >
                  テンプレートを挿入
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 