#!/bin/bash

# Quick DNS Status Check for remise.farm
# Run this script to get a quick status update

DOMAIN_WWW="www.remise.farm"
DOMAIN_ROOT="remise.farm"
EXPECTED_CNAME="remise-rov8.onrender.com"
EXPECTED_IP="216.24.57.1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 DNS Status Check for remise.farm${NC}"
echo -e "${BLUE}Time: $(date)${NC}"
echo ""

check_domain() {
    local domain=$1
    local expected_value=$2
    local record_type=$3
    
    echo -e "${BLUE}Checking $domain ($record_type record)...${NC}"
    
    if [ "$record_type" = "CNAME" ]; then
        result=$(nslookup $domain 2>/dev/null | grep -A 1 "Name:" | tail -1 | awk '{print $NF}' | tr -d '.')
        if [[ "$result" == *"$expected_value"* ]]; then
            echo -e "${GREEN}✅ $domain → $result (CORRECT!)${NC}"
            return 0
        else
            echo -e "${RED}❌ $domain → $result (Expected: $expected_value)${NC}"
            return 1
        fi
    else
        result=$(nslookup $domain 2>/dev/null | grep -A 5 "Non-authoritative answer:" | grep "Address:" | awk '{print $2}' | head -1)
        if [[ "$result" == *"$expected_value"* ]]; then
            echo -e "${GREEN}✅ $domain → $result (CORRECT!)${NC}"
            return 0
        else
            echo -e "${RED}❌ $domain → $result (Expected: $expected_value)${NC}"
            return 1
        fi
    fi
}

# Check both domains
www_status=0
root_status=0

check_domain $DOMAIN_WWW $EXPECTED_CNAME "CNAME"
www_status=$?

check_domain $DOMAIN_ROOT $EXPECTED_IP "A"
root_status=$?

echo ""
echo -e "${BLUE}📊 Summary:${NC}"

if [ $www_status -eq 0 ] && [ $root_status -eq 0 ]; then
    echo -e "${GREEN}🎉 DNS PROPAGATION COMPLETE!${NC}"
    echo -e "${GREEN}Both domains are ready for verification in Render.${NC}"
elif [ $www_status -eq 0 ] || [ $root_status -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Partial propagation detected.${NC}"
    echo -e "${YELLOW}One domain is ready, the other is still propagating.${NC}"
else
    echo -e "${RED}❌ DNS propagation still in progress.${NC}"
    echo -e "${RED}Both domains are still pointing to old servers.${NC}"
fi

echo ""
echo -e "${BLUE}💡 Tips:${NC}"
echo -e "${BLUE}  • DNS propagation can take 15 minutes to 24 hours${NC}"
echo -e "${BLUE}  • Run this script periodically to check progress${NC}"
echo -e "${BLUE}  • Use the monitor script for continuous monitoring${NC}"
echo -e "${BLUE}  • Check different DNS servers if needed${NC}"
