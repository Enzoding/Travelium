/**
 * NeoDB API 演示脚本
 * 
 * 这个脚本演示如何使用 NeoDB API 获取书籍数据
 * 可以通过命令行参数指定搜索关键词
 */

import axios from 'axios';

// NeoDB API 基础 URL
const NEODB_API_BASE_URL = 'https://neodb.social';

// 定义书籍类型接口
interface NeoDBItem {
  id: string;
  type: string;
  uuid: string;
  url: string;
  api_url: string;
  category: string;
  title: string;
  display_title: string;
  description: string;
  cover_image_url?: string;
  rating: number | null;
  rating_count: number;
  tags: string[];
  // 书籍特有字段
  author?: string[];
  publisher?: string[];
  publish_date?: string;
  isbn?: string;
  // 其他可能的字段
  [key: string]: any;
}

interface NeoDBSearchResponse {
  data: NeoDBItem[];
  pages: number;
  count: number;
}

// 搜索书籍函数
async function searchBooks(keyword: string): Promise<void> {
  try {
    console.log(`正在搜索关键词: "${keyword}"...`);
    
    const response = await axios.get<NeoDBSearchResponse>(`${NEODB_API_BASE_URL}/api/catalog/search`, {
      params: {
        query: keyword,
        limit: 10
      }
    });
    
    // 过滤出类型为 "book" 的项目
    const books = response.data.data.filter(item => item.category === 'book');
    
    if (books.length > 0) {
      console.log(`\n找到 ${books.length} 本相关书籍:\n`);
      
      books.forEach((book, index) => {
        console.log(`[${index + 1}] ${book.title}`);
        console.log(`   ID: ${book.uuid}`);
        console.log(`   链接: ${NEODB_API_BASE_URL}${book.url}`);
        if (book.description) console.log(`   简介: ${book.description.substring(0, 100)}${book.description.length > 100 ? '...' : ''}`);
        if (book.rating) console.log(`   评分: ${book.rating.toFixed(1)} (${book.rating_count} 人评价)`);
        if (book.cover_image_url) console.log(`   封面图片: ${book.cover_image_url}`);
        if (book.tags && book.tags.length > 0) console.log(`   标签: ${book.tags.slice(0, 5).join(', ')}${book.tags.length > 5 ? '...' : ''}`);
        console.log('');
      });
    } else {
      console.log('未找到相关书籍');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`请求错误: ${error.message}`);
      if (error.response) {
        console.error(`状态码: ${error.response.status}`);
        console.error(`响应数据: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    } else {
      console.error(`发生错误: ${error}`);
    }
  }
}

// 获取书籍详情函数
async function getBookDetails(bookId: string): Promise<void> {
  try {
    console.log(`正在获取书籍 ID: "${bookId}" 的详细信息...`);
    
    const response = await axios.get(`${NEODB_API_BASE_URL}/api/book/${bookId}`);
    
    if (response.data) {
      const book = response.data;
      console.log('\n书籍详情:');
      console.log(`标题: ${book.title}`);
      if (book.localized_title && book.localized_title.length > 0) {
        console.log('其他语言标题:');
        book.localized_title.forEach((title: any) => {
          console.log(`   ${title.lang}: ${title.text}`);
        });
      }
      if (book.author) console.log(`作者: ${Array.isArray(book.author) ? book.author.join(', ') : book.author}`);
      if (book.publisher) console.log(`出版社: ${Array.isArray(book.publisher) ? book.publisher.join(', ') : book.publisher}`);
      if (book.publish_date) console.log(`出版日期: ${book.publish_date}`);
      if (book.isbn) console.log(`ISBN: ${book.isbn}`);
      if (book.rating) console.log(`评分: ${book.rating} (${book.rating_count} 人评价)`);
      if (book.description) console.log(`\n简介:\n${book.description}`);
      if (book.cover_image_url) console.log(`\n封面图片: ${book.cover_image_url}`);
      if (book.tags && book.tags.length > 0) console.log(`\n标签: ${book.tags.join(', ')}`);
      
      // 显示外部资源链接
      if (book.external_resources && book.external_resources.length > 0) {
        console.log('\n外部资源链接:');
        book.external_resources.forEach((resource: any) => {
          console.log(`   ${resource.url}`);
        });
      }
    } else {
      console.log('未找到书籍或返回数据格式不正确');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`请求错误: ${error.message}`);
      if (error.response) {
        console.error(`状态码: ${error.response.status}`);
        console.error(`响应数据: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    } else {
      console.error(`发生错误: ${error}`);
    }
  }
}

// 主函数
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('用法:');
    console.log('  搜索书籍: npx ts-node scripts/neodb-api-demo.ts search "关键词"');
    console.log('  获取书籍详情: npx ts-node scripts/neodb-api-demo.ts book "书籍ID"');
    return;
  }
  
  const command = args[0];
  
  if (command === 'search' && args[1]) {
    await searchBooks(args[1]);
  } else if (command === 'book' && args[1]) {
    await getBookDetails(args[1]);
  } else {
    console.log('无效的命令或参数');
    console.log('用法:');
    console.log('  搜索书籍: npx ts-node scripts/neodb-api-demo.ts search "关键词"');
    console.log('  获取书籍详情: npx ts-node scripts/neodb-api-demo.ts book "书籍ID"');
  }
}

// 执行主函数
main().catch(error => {
  console.error('程序执行出错:', error);
  process.exit(1);
});
