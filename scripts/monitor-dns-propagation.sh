#!/bin/bash

# DNS Propagation Monitor for remise.farm
# This script monitors DNS propagation and alerts when complete

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

echo -e "${BLUE}🔍 Starting DNS propagation monitor for remise.farm${NC}"
echo -e "${BLUE}Expected CNAME: ${EXPECTED_CNAME}${NC}"
echo -e "${BLUE}Expected IP: ${EXPECTED_IP}${NC}"
echo -e "${BLUE}Press Ctrl+C to stop monitoring${NC}"
echo ""

check_dns() {
    local domain=$1
    local expected_value=$2
    local record_type=$3
    
    if [ "$record_type" = "CNAME" ]; then
        # Check CNAME record
        result=$(nslookup $domain | grep -A 1 "Name:" | tail -1 | awk '{print $NF}' | tr -d '.')
        if [[ "$result" == *"$expected_value"* ]]; then
            return 0  # Success
        else
            echo -e "${YELLOW}⏳ $domain CNAME: $result${NC}"
            return 1  # Still propagating
        fi
    else
        # Check A record
        result=$(nslookup $domain | grep -A 5 "Non-authoritative answer:" | grep "Address:" | awk '{print $2}' | head -1)
        if [[ "$result" == *"$expected_value"* ]]; then
            return 0  # Success
        else
            echo -e "${YELLOW}⏳ $domain A: $result${NC}"
            return 1  # Still propagating
        fi
    fi
}

monitor_loop() {
    local check_count=0
    local start_time=$(date +%s)
    
    while true; do
        check_count=$((check_count + 1))
        current_time=$(date +%s)
        elapsed=$((current_time - start_time))
        
        echo -e "${BLUE}🔄 Check #$check_count (${elapsed}s elapsed) - $(date)${NC}"
        
        # Check www subdomain CNAME
        if check_dns $DOMAIN_WWW $EXPECTED_CNAME "CNAME"; then
            echo -e "${GREEN}✅ $DOMAIN_WWW CNAME propagated successfully!${NC}"
            www_ready=true
        else
            www_ready=false
        fi
        
        # Check root domain A record
        if check_dns $DOMAIN_ROOT $EXPECTED_IP "A"; then
            echo -e "${GREEN}✅ $DOMAIN_ROOT A record propagated successfully!${NC}"
            root_ready=true
        else
            root_ready=false
        fi
        
        # Check if both are ready
        if [ "$www_ready" = true ] && [ "$root_ready" = true ]; then
            echo ""
            echo -e "${GREEN}🎉 DNS PROPAGATION COMPLETE! 🎉${NC}"
            echo -e "${GREEN}Both domains are now pointing to Render:${NC}"
            echo -e "${GREEN}  ✅ www.remise.farm → $EXPECTED_CNAME${NC}"
            echo -e "${GREEN}  ✅ remise.farm → $EXPECTED_IP${NC}"
            echo ""
            echo -e "${BLUE}🚀 Next steps:${NC}"
            echo -e "${BLUE}  1. Go to your Render dashboard${NC}"
            echo -e "${BLUE}  2. Click 'Verify' on both domains${NC}"
            echo -e "${BLUE}  3. Wait for SSL certificates to provision${NC}"
            echo -e "${BLUE}  4. Test your custom domain!${NC}"
            echo ""
            
            # Try to open browser (macOS)
            if command -v open >/dev/null 2>&1; then
                echo -e "${BLUE}🌐 Opening Render dashboard...${NC}"
                open "https://dashboard.render.com/web/srv-d360atmmcj7s73dp94fg/settings"
            fi
            
            break
        else
            echo -e "${YELLOW}⏳ Still propagating... waiting 30 seconds${NC}"
            echo ""
            sleep 30
        fi
    done
}

# Handle Ctrl+C gracefully
trap 'echo -e "\n${RED}🛑 Monitoring stopped by user${NC}"; exit 0' INT

# Start monitoring
monitor_loop
