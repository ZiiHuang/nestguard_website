# nestguard_website

rename:
a=1; for f in *.jpg; do mv "$f" "$a.jpg"; ((a++)); done

resize:
mkdir resized
for f in *.jpg; do
  sips --resampleWidth 800 "$f" --out "resized/$f"
done
