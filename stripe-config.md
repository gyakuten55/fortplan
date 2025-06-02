# Stripe設定情報

## ✅ 設定完了！

すべての必要な情報が揃いました：

- ✅ **商品ID**: prod_SPG5Exh73KB97G
- ✅ **価格ID**: price_1RURZRH4gst7Ys3lideQANOf
- ✅ **公開キー**: 設定済み
- ✅ **シークレットキー**: 取得済み

## 📁 .env.local ファイルの作成

プロジェクトルートに `.env.local` ファイルを作成し、以下をコピー＆ペーストしてください：

```bash
# Stripe設定（本番環境）
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE
STRIPE_PRICE_ID=price_1RURZRH4gst7Ys3lideQANOf
```

**注意：実際のキーは別途提供されている値に置き換えてください**

## 🚀 次のステップ

1. **アプリケーションを再起動**
   ```bash
   npm run dev
   ```

2. **決済機能をテスト**
   - http://localhost:3000/purchase にアクセス
   - 「Stripe設定が不完全です」エラーが消えていることを確認
   - 「Stripeで決済を開始」ボタンをクリック
   - Stripeの決済ページに正常に移動することを確認

3. **⚠️ 本番環境での注意点**
   - 実際の決済が発生します
   - テストカードは使用できません
   - 実際のクレジットカードが必要になります

## 🔒 セキュリティチェックリスト

- ✅ `.env.local` が `.gitignore` に含まれている
- ✅ シークレットキーをコードに直接書かない
- ✅ 環境変数として安全に管理
- ✅ 本番環境キーを使用（`pk_live_` / `sk_live_`）

## 🎯 確認方法

設定が正しく完了していれば：
1. 決済ページでエラーが表示されない
2. 「Stripeで決済を開始」ボタンが機能する
3. Stripeの決済ページに正常に移動する

設定完了です！🎉 