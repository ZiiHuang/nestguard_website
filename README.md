# nestguard_website

mkdir resized
for f in *.jpg; do
  sips --resampleWidth 800 "$f" --out "resized/$f"
done
