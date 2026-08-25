#!/bin/bash
branches="origin/v0.2 origin/feature/v0.3.0-milestone origin/final-launch origin/fix/api-key-and-overflow origin/main"

for branch in $branches; do
  git ls-tree -r --name-only $branch | awk '/^src\/.*\.ts$/' >> all_ts_files.txt
done
sort -u all_ts_files.txt -o all_ts_files.txt

echo "Starting update process..."
count=0

while IFS= read -r file; do
  latest_date=0
  latest_branch=""
  
  for branch in $branches; do
    if git ls-tree -r $branch --name-only | grep -q "^$file$"; then
      branch_date=$(git log -1 --format="%ct" $branch -- "$file")
      if [ ! -z "$branch_date" ] && [ "$branch_date" -gt "$latest_date" ]; then
        latest_date=$branch_date
        latest_branch=$branch
      fi
    fi
  done
  
  if [ "$latest_branch" != "origin/main" ] && [ "$latest_branch" != "" ]; then
    echo "Updating $file from $latest_branch"
    git checkout $latest_branch -- "$file"
    count=$((count+1))
  fi
done < all_ts_files.txt

echo "Successfully updated $count TypeScript files to their latest versions across all branches."
